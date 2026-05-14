---
title: 替靜態站加上訪客計數 — Nuxt + Upstash Redis 的最小組合
date: 2026-05-13
description: 靜態 / SSR 站想要一個「總到訪者數」與「每篇閱讀數」的小功能，不想跑自己的伺服器。用 Upstash Redis 的免費 REST API + Nuxt server routes 二十分鐘就能搞定，含 cookie 防刷與環境變數踩坑紀錄。
tags: [nuxt, upstash, redis, vercel, serverless]
readMin: 10
draft: false
---

寫 portfolio 站的時候很自然會冒出念頭：「這篇有人看嗎？」「上個月有幾個人來？」——但你不會為了一個小計數器跑一台 server，也不想被 Google Analytics 那種龐然大物綁架。

這篇紀錄一個「最小可行的計數系統」做法：**Upstash Redis（免費 tier）+ Nuxt server routes + cookie 節流**，加起來大約 20 分鐘可以接好。

## 為什麼選 Upstash 而不是 KV / GA / Counter.dev

| 方案 | 上限 | 自有資料 | 設定難度 |
|---|---|---|---|
| **Upstash Redis** | 免費 10K cmd/day | ✅ | 中 |
| **Vercel KV** | 免費 30K cmd/month | ✅ | 中 |
| **Counter.dev** | 無限 | ❌ 第三方 | 低 |
| **Google Analytics** | 無限 | ❌ + 浮誇 | 高 |
| **自建 Postgres** | 取決於 host | ✅ | 高 |

**Upstash 的 sweet spot**：

- **REST API** 介接（不用維持 TCP 連線，serverless 環境最友善）
- 免費 tier 對個人站綽綽有餘（每天 10K commands，1 次造訪通常 ≤ 2 commands）
- 自己擁有資料，要 dump、要遷移都可以
- 開戶 → 建 DB → 取 token 全程 3 分鐘

## 整體架構

```
瀏覽器                    Nuxt server route             Upstash REST API
   │                            │                              │
   ├── POST /api/stats/visit ──→│                              │
   │                            │── INCR stats:total_visits ──→│
   │                            │←─────── new total ───────────│
   │←─── { total, enabled } ────│                              │
   │                            │
   ├── 顯示 hero badge          │
   │   "這座森林來過 N 位旅人"   │
```

關鍵設計：**Redis 連線只在 server 端發生**——瀏覽器永遠不會直接接觸 token。Nuxt server route 包一層 REST 封裝，順便加 cookie 節流。

## Step 1：Upstash 註冊 + 建 DB

到 [upstash.com](https://upstash.com) 用 GitHub 登入，到 console 點 **Create Database**：

| 欄位 | 填什麼 |
|---|---|
| **Type** | Regional（不用 Global） |
| **Region** | 挑離你最近的（`ap-northeast-1` Tokyo / `us-east-1`） |
| **Plan** | Free |

建完進去 detail 頁，往下捲找 **REST API** 區塊，會看到兩個值：

```
UPSTASH_REDIS_REST_URL    = https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN  = AaAaAaAaAaAaAa...
```

## Step 2：本機 `.env`

在 Nuxt 專案根目錄（有 `nuxt.config.ts` 那層）建一個 `.env`：

```bash
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AaAaAaAaAaAaAa...
```

> ⚠️ **務必檢查 `.gitignore`** 有沒有 `.env` 跟 `.env.*`——Nuxt 預設模板有，但被人手動移除過就慘了。Token 流到 GitHub 是經典災難。

## Step 3：裝 client

```bash
npm install @upstash/redis
```

## Step 4：server util — 連線封裝

```ts
// server/utils/redis.ts
import { Redis } from '@upstash/redis'

let cached: Redis | null = null
let warnedMissing = false

export function getRedis(): Redis | null {
  if (cached) return cached
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (!warnedMissing) {
      console.warn('[stats] env vars not set — counter disabled.')
      warnedMissing = true
    }
    return null
  }
  cached = new Redis({ url, token })
  return cached
}
```

**重點設計**：env 變數沒設時回傳 `null` 而不是 throw。讓 caller 自己決定要 fallback 還是 error。

## Step 5：總到訪數端點（含 cookie 節流）

```ts
// server/api/stats/visit.post.ts
import { getRedis } from '~~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const redis = getRedis()
  if (!redis) return { total: 0, enabled: false }

  // 12 小時內同一瀏覽器只計一次
  const cookie = getCookie(event, 'qn_visited')
  const now = Date.now()
  const THROTTLE_MS = 12 * 60 * 60 * 1000

  let shouldIncrement = true
  if (cookie) {
    const last = Number(cookie)
    if (Number.isFinite(last) && now - last < THROTTLE_MS) {
      shouldIncrement = false
    }
  }

  const total = shouldIncrement
    ? await redis.incr('stats:total_visits')
    : ((await redis.get<number>('stats:total_visits')) ?? 0)

  if (shouldIncrement) {
    setCookie(event, 'qn_visited', String(now), {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      path: '/',
    })
  }

  return { total, enabled: true }
})
```

兩個設計細節：

1. **Cookie throttle**：12 小時 cookie 避免狂刷 F5 灌水
2. **INCR 是 atomic**：Redis 的 `INCR` 命令本身就是 atomic counter，不用擔心 race condition

## Step 6：單篇閱讀數端點

```ts
// server/api/stats/note/[slug].post.ts
import { getRedis } from '~~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const redis = getRedis()
  if (!redis) return { count: 0, enabled: false }

  const cookieName = `qn_n_${slug.replace(/[^a-z0-9-]/gi, '')}`
  const cookie = getCookie(event, cookieName)
  const now = Date.now()
  const THROTTLE_MS = 6 * 60 * 60 * 1000  // 6h per article

  let shouldIncrement = true
  if (cookie) {
    const last = Number(cookie)
    if (Number.isFinite(last) && now - last < THROTTLE_MS) shouldIncrement = false
  }

  const key = `stats:note:${slug}`
  const count = shouldIncrement
    ? await redis.incr(key)
    : ((await redis.get<number>(key)) ?? 0)

  if (shouldIncrement) {
    setCookie(event, cookieName, String(now), {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      path: '/',
    })
  }

  return { count, enabled: true }
})
```

每篇文章有自己的 cookie name，互不干擾。slug 被清理（只留英數與 `-`），避免奇怪字元跑進 cookie name。

## Step 7：批次取數端點（給列表頁用）

列表頁要一次顯示 5-10 篇的 view count，一筆筆 fetch 會打爆連線。用 Redis `MGET` 一次拿：

```ts
// server/api/stats/notes.get.ts
import { getRedis } from '~~/server/utils/redis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slugs = String(query.slugs ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (slugs.length === 0) return { counts: {}, enabled: false }

  const redis = getRedis()
  if (!redis) return { counts: {}, enabled: false }

  const keys = slugs.map(s => `stats:note:${s}`)
  const values = await redis.mget<(number | null)[]>(...keys)
  const counts: Record<string, number> = {}
  slugs.forEach((slug, i) => { counts[slug] = values[i] ?? 0 })

  return { counts, enabled: true }
})
```

呼叫方式：`GET /api/stats/notes?slugs=foo,bar,baz`

## Step 8：前端 composable

```ts
// app/composables/useStats.ts
export async function trackVisit(): Promise<number> {
  try {
    const res = await $fetch<{ total: number; enabled: boolean }>(
      '/api/stats/visit',
      { method: 'POST' },
    )
    return res.total
  } catch {
    return 0
  }
}

export async function trackNoteView(slug: string): Promise<number> {
  try {
    const res = await $fetch<{ count: number; enabled: boolean }>(
      `/api/stats/note/${encodeURIComponent(slug)}`,
      { method: 'POST' },
    )
    return res.count
  } catch {
    return 0
  }
}

export async function fetchNoteCounts(slugs: string[]): Promise<Record<string, number>> {
  if (!slugs.length) return {}
  try {
    const res = await $fetch<{ counts: Record<string, number> }>(
      '/api/stats/notes',
      { query: { slugs: slugs.join(',') } },
    )
    return res.counts
  } catch {
    return {}
  }
}
```

`catch` 一律回 0——前端任何失敗都不該破壞畫面。

## Step 9：頁面整合

首頁：

```vue
<script setup>
const totalVisits = ref(0)
const noteCounts = ref<Record<string, number>>({})

onMounted(() => {
  trackVisit().then((n) => { totalVisits.value = n })
  const slugs = (notes.value ?? []).map(n => n.path.replace(/^\/notes\//, ''))
  if (slugs.length) {
    fetchNoteCounts(slugs).then((map) => { noteCounts.value = map })
  }
})
</script>

<template>
  <aside v-if="totalVisits > 0" class="visit-badge">
    這座森林來過 {{ totalVisits.toLocaleString() }} 位旅人
  </aside>
</template>
```

文章頁：

```vue
<script setup>
const route = useRoute()
const viewCount = ref(0)

onMounted(() => {
  const slug = route.path.replace(/^\/notes\//, '')
  trackNoteView(slug).then((n) => { viewCount.value = n })
})
</script>
```

**`v-if="totalVisits > 0"` 是關鍵**：沒設 env 變數的情況下徽章自動隱身，網站不會破洞露 0。

## Step 10：視覺層 — 像素徽章與眼睛 sprite

光有數字沒有 sprite 不算 Pixel Cozy。徽章與眼睛全部 inline SVG 手刻，配合 `image-rendering: pixelated` 保留像素感。

### Hero 右上角徽章

```vue
<aside v-if="totalVisits > 0" class="visit-badge" aria-label="累計訪客數">
  <svg class="badge-eye" viewBox="0 0 16 8" shape-rendering="crispEdges">
    <rect x="3" y="2" width="10" height="1" fill="#1f3329"/>
    <rect x="2" y="3" width="1" height="2" fill="#1f3329"/>
    <rect x="13" y="3" width="1" height="2" fill="#1f3329"/>
    <rect x="3" y="5" width="10" height="1" fill="#1f3329"/>
    <rect x="3" y="3" width="10" height="2" fill="#f3e8c6"/>
    <rect x="6" y="3" width="4" height="2" fill="#1f3329"/>
    <rect x="7" y="3" width="1" height="1" fill="#fffbf2"/>
  </svg>
  <span class="badge-text">
    <span class="badge-prefix">這座森林來過</span>
    <span class="badge-count">{{ totalVisits.toLocaleString() }}</span>
    <span class="badge-suffix">位旅人</span>
  </span>
</aside>
```

CSS：

```css
.visit-badge {
  position: fixed;
  top: 20px; right: 20px;
  z-index: 90;
  display: inline-flex;
  align-items: center;
  gap: .55rem;
  padding: 7px 14px;
  background: #fffbf2;
  color: #1f3329;
  border: 2px solid #1f3329;
  border-radius: 999px;
  box-shadow: 3px 3px 0 #1f3329;       /* Pixel Cozy 招牌硬陰影 */
  font-family: 'JetBrains Mono', monospace;
  font-size: .78rem;
  animation: badge-enter .5s steps(3) .8s both;
  transition: transform .15s, box-shadow .15s;
}
.visit-badge:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #1f3329;
}
.badge-eye {
  width: 22px; height: 11px;
  image-rendering: pixelated;            /* 保留像素硬邊 */
}
.badge-count {
  font-family: 'Pixelify Sans', sans-serif;
  font-weight: 600;
  color: #e57865;                        /* 珊瑚紅重音 */
  font-variant-numeric: tabular-nums;   /* 數字等寬避免跳動 */
}
@keyframes badge-enter {
  0%   { opacity: 0; transform: translateY(-12px) scale(.85); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* 行動裝置：藏掉前綴文字，只留數字 */
@media (max-width: 600px) {
  .visit-badge { top: 12px; right: 12px; padding: 5px 10px; font-size: .72rem; }
  .badge-prefix { display: none; }
}
```

**Pixel Cozy 動畫關鍵**：`animation: badge-enter .5s steps(3)` 用 `steps(3)` 不是 ease——平滑 tween 會破壞像素感，分 3 段「卡幀」進場才有 8-bit 味。

### 筆記卡片角落眼睛

更小的眼睛（12×6）放在卡片右下：

```vue
<span v-if="noteCounts[slug]" class="views">
  <svg class="eye-sprite" viewBox="0 0 12 6" shape-rendering="crispEdges">
    <rect x="2" y="1" width="8" height="1" fill="#4a6f5d"/>
    <rect x="1" y="2" width="1" height="2" fill="#4a6f5d"/>
    <rect x="10" y="2" width="1" height="2" fill="#4a6f5d"/>
    <rect x="2" y="4" width="8" height="1" fill="#4a6f5d"/>
    <rect x="2" y="2" width="8" height="2" fill="#f3e8c6"/>
    <rect x="5" y="2" width="2" height="2" fill="#1f3329"/>
  </svg>
  {{ noteCounts[slug] }}
</span>
```

```css
.views {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  color: #4a6f5d;
  font-variant-numeric: tabular-nums;
}
.eye-sprite {
  width: 14px;
  height: 7px;
  image-rendering: pixelated;
}
```

**6×2 像素就能畫眼珠**——sprite 越小，看起來越像素，越可愛。把 viewBox 控制在 12×6 而不是 32×32 是刻意的。

---

## Step 11：Vercel 環境變數

到 Vercel dashboard → Project → **Settings → Environment Variables**：

| Name | Value | 環境 |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | 你的 URL | Production / Preview / Development 全勾 |
| `UPSTASH_REDIS_REST_TOKEN` | 你的 token | 同上 |

存完之後**必須觸發 redeploy** 才會吃到（在 Deployments 列表最上面那個點 `...` → Redeploy）。

## 一個必踩的小坑：env 變數的時機

```
dev：    npm run dev 啟動時讀 .env → 不重啟就不會重新讀
build：  vercel build 時讀環境變數 → 寫進 .output/
runtime: serverless function 從 Vercel 環境變數讀
```

**改了 `.env` 一定要重啟 dev server**，光改檔不會生效。我第一次踩這坑——改完 .env 重新 curl，發現還是回 `enabled: false`，以為 Upstash 連線壞了，其實只是沒重啟。

## 抽象出來的設計原則

把這個案例的決策列下來，下次做類似功能可以照搬：

1. **Env 沒設時 graceful fallback** — 永遠不要因為設定缺漏讓 UI 崩
2. **Atomic operation 優先** — 用 `INCR` 而不是 `GET → +1 → SET`
3. **Cookie 節流而不是 IP 黑名單** — 簡單、不用 server 狀態、不會誤殺 NAT 後的多人
4. **token 永遠不過瀏覽器** — Server route 包一層，前端拿到的只是統計結果
5. **批次端點降低呼叫量** — 列表頁的 N 篇文章一次抓完，不要打 N 次 API

## 成本估算

| 動作 | Redis commands | 每天理論上限（10K） |
|---|---|---|
| 1 次首頁訪問 | 1 INCR + 1 MGET | 約 5,000 次訪問 |
| 1 次文章閱讀 | 1 INCR | 約 10,000 次 |

實際上 cookie 節流會把同人重複訪問的 commands 砍到接近 0（只剩 GET），所以一天「真正的」訪客數能撐到數千是沒問題的。對個人站夠用很多年。

爆量再升 paid plan（USD 0.2/100K commands），或遷到 Cloudflare D1 / Postgres——資料是你自己的，遷移成本可控。
