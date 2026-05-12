---
title: Nuxt Content v3 部署到 Vercel — queryCollection 在 serverless 環境 404 的根因
description: 本機 dev 正常、Vercel 上 /notes 全 404 的踩坑紀錄。表面是 404，根因是 SQLite 沒進 function bundle，解法是 prerender。
date: 2026-05-12
tags: [nuxt, vercel, content, sqlite, debugging]
readMin: 8
draft: false
---

這篇是一個只在 production 才會炸的踩坑紀錄。本機 dev 一切正常，部署到 Vercel 後筆記頁全部 404。從表面現象到根因到解法，包含找問題的思路。

## 表面現象

部署 Nuxt 4 + Nuxt Content v3 專案到 Vercel，首次部署成功，但訪問結果不一致：

```bash
curl -o /dev/null -w "%{http_code}\n" https://your-site.vercel.app/
# 200 ← 主頁通

curl -o /dev/null -w "%{http_code}\n" https://your-site.vercel.app/about
# 404 ← about 不通

curl -o /dev/null -w "%{http_code}\n" https://your-site.vercel.app/notes/some-note
# 404 ← 任何筆記都不通
```

主頁本身能渲染，但主頁底下「最近的筆記」區塊空空，顯示「還沒有任何筆記」。

> 同樣的 code 在本機 `npm run dev` 完全正常，5 篇筆記都顯示得好好的。

## 第一步診斷：分類路由

最關鍵的觀察：**哪些路由通、哪些路由 404，有沒有規律？**

| 路由 | 狀態 | 共同點 |
|---|---|---|
| `/` | ✅ 200 | 主頁本身的元素是寫死的 |
| `/preview` | ✅ 200 | 用 hardcoded fake data |
| `/about` | ❌ 404 | 內容來自 `content/about.md` |
| `/notes/*` | ❌ 404 | 內容來自 `content/notes/*.md` |

通的路由跟 404 的路由的分界，**不是** client / server，不是 static / dynamic，而是「**有沒有呼叫 `queryCollection()`**」。

抓到這條分界，可以直接跳結論：**`queryCollection` 在 serverless 環境讀不到資料**。

## 根因：SQLite 沒上船

Nuxt Content **v3** 從 v2 時代的「JSON 記憶體索引」改用 **SQLite** 作內容索引：

1. 你寫 `.md` → Nuxt Content 解析 → 寫入 `.data/content/contents.sqlite`
2. 你呼叫 `queryCollection()` → 翻譯成 SQL → 從 SQLite 查資料 → 回傳

本機 dev 模式下，整個流程都在你的 file system 上跑，自然沒問題。

**部署到 Vercel 後問題出在：**

```
.output/              ← Vercel 把這資料夾打包到 serverless function
├── public/           ← 靜態檔（CDN 服務）
└── server/           ← function bundle
    ├── index.mjs
    └── chunks/

.data/                ← ⚠️ 這資料夾不會進 function bundle
└── content/
    └── contents.sqlite  ← 你的內容索引在這裡
```

Serverless function 啟動後**找不到 SQLite 檔**，所有 `queryCollection` 回傳空 / 拋錯，路由處理函式只能回 404。

額外複雜的是：Nuxt Content v3 用 `better-sqlite3`，這是 **native module（C++ binary）**。本機在 Windows 編譯出來的版本，**就算**檔案被打包進去，丟到 Vercel 的 Linux 環境也不一定能直接執行——可能還要再踩一次跨平台編譯的坑。

## 為什麼這個坑只在 production 才會炸

```
本機 dev：
  Nuxt → 讀檔系統 → .data/content/contents.sqlite ✓

Vercel serverless：
  Function bundle → 沒有 .data/ → 沒有 SQLite ✗
```

這是 dev 與 production 兩個世界根本性的差異：

| 環境 | 檔案系統 |
|---|---|
| **dev** | 整個專案資料夾隨意讀寫 |
| **production (serverless)** | 只有打包進來的東西，且唯讀 |

任何在 dev 期間「隨手存在 file system 然後讀回來」的習慣，到 serverless 都會炸。

## 解法：prerender（靜態預渲染）

對「內容低頻更新」的 Portfolio / Blog，**最乾淨的解法是讓 build 時就把每篇筆記烤成靜態 HTML**。

邏輯逆推：

- 既然 build 時讀得到 SQLite（build runner 在自己的 file system 跑）
- runtime 讀不到 SQLite
- 那就讓 build 時把答案算完，runtime 直接吃靜態結果

`nuxt.config.ts` 加：

```ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about'],
      failOnError: false,
    },
  },
})
```

每個欄位的意義：

- **`routes: ['/', '/about']`** — 預渲染的起點頁
- **`crawlLinks: true`** — 從起點出發，**自動跟著所有 `<NuxtLink>` 走訪**。會自動發現 `/notes/learning-nuxt-init` 等所有筆記頁，不用一條條列
- **`failOnError: false`** — 個別頁出錯不擋整體 build。對「逐步補上頁面」的階段比較寬容

push 後 Vercel 自動 redeploy，1-2 分鐘後筆記頁就活了。

> **附帶好處**：靜態頁面比 serverless function 還快——沒有 cold start、直接從 edge CDN 吐 HTML。免費方案的流量也算得便宜。

## 為什麼推薦 prerender 不推薦其他解法

其實還有幾條替代路線，但對 Portfolio 都不如 prerender 適合：

### 替代 A：換 SQLite 後端

Nuxt Content v3 支援多種 SQLite 後端：

- `node:sqlite`（Node 22+ 內建，不用 native build）
- `@libsql/client`（Cloudflare、邊緣運算）
- 雲端模式（NuxtHub 的遠端 DB）

**缺點**：要查 v3 文件確認配置、增加 runtime 複雜度。對「幾十篇筆記」的個人站，runtime DB 完全是 overkill。

### 替代 B：把 `.data/` 強制塞進 function bundle

用 `nitro.publicAssets` 或 `serverDir` 把 `.data/` 帶上船。

**缺點**：感覺像「強迫不該打包的東西打包」，繞圈圈。而且還沒解決 native binary 跨平台問題。

### 替代 C：在 Vercel rebuild native modules

加 `vercel-build` script 強制重編 `better-sqlite3`。

**缺點**：每次部署多花 1-2 分鐘，且更脆——Node 版本一變就可能再壞。

**結論**：對「內容低頻更新、沒搜尋 / 評論等動態互動」的 Portfolio，prerender 是用 build-time 換 runtime-simplicity 的最佳解。

## 教訓：dev 環境的「免費假設」

這個坑的根本教訓不在「prerender 怎麼寫」，而在**識別 dev 與 production 的環境差異**。

Dev 環境永遠是「最寬容」的：

- 整個檔案系統都能讀寫
- Native module 是本機編譯的版本
- 沒有 cold start
- 環境變數隨手 `process.env.X`

Production（特別是 serverless）永遠是「最嚴格」的：

- 只能讀打包進來的東西
- 跨平台二進位風險
- Cold start 影響 perf
- 環境變數要平台後台設定

> **每次採用會在 build 時做特殊事情的套件**（Nuxt Content、Prisma、image processing 等），**都要先問一句：「production 怎麼跑？」** 不問的話，部署到一半才發現是常事。

抓到這個原則後，下次撞到類似坑會快很多——分類成功 vs 失敗的路由，看它們的共同點，多半就指向真兇了。
