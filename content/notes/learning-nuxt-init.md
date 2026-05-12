---
title: 從零初始化一個 Nuxt 3 + Content 專案的過程
description: Vue 工程師第一次用 Nuxt 4 + Content 建專案的完整紀錄，含 better-sqlite3 與 TTY 踩坑解析
date: 2026-05-08
tags: [nuxt, vue, learning, setup]
draft: false
---

# 從零初始化一個 Nuxt 3 + Content 專案

> 這篇是我（Vue 工程師，第一次用 Nuxt）動手建 Portfolio 時的初始化筆記。
> 目標：寫成「下一個跟我一樣沒用過 Nuxt 的人能照抄」。

---

## 環境前提

- Node.js v25.8.1
- npm 11.11.0
- 作業系統：Windows 11（Git Bash）

> Nuxt 3 / 4 至少需要 Node 18+。我用 v25 沒問題。

---

## Step 1：用 `nuxi` 建立專案骨架

`nuxi` 是 Nuxt 官方的 CLI，類似 Vite 的 `create-vite`。**不需要事先全域安裝**，用 `npx` 跑最新版即可。

```bash
npx nuxi@latest init site --template content --packageManager npm --no-gitInit --no-install
```

### 參數逐一說明

| 參數 | 用途 |
|---|---|
| `init site` | 建立名為 `site` 的資料夾，當作專案根目錄 |
| `--template content` | 使用「Content-driven website」官方模板（已預設裝好 `@nuxt/content`） |
| `--packageManager npm` | 指定用 npm（也可以選 pnpm / yarn / bun） |
| `--no-gitInit` | 不要自動 `git init`（我自己有規劃 git 結構） |
| `--no-install` | 先不要裝依賴（我想單獨檢視 package.json 後再裝） |

### 可選的模板有哪些？

互動模式下會列出 4 種：

- `minimal` — 最精簡的 Nuxt 4 起手式（預設）
- `content` — 內容導向網站（部落格 / 文件 / Portfolio 都適合）✅ 我選這個
- `module` — 開發 Nuxt 模組（給套件作者用）
- `ui` — 使用 Nuxt UI 元件庫的起手式

> ⚠️ 互動模式會卡在 prompt（在自動化腳本中跑不過），記得加 `--template` 直接指定。

---

## Step 2：產生的目錄結構

```
site/
├── app/                ← 應用程式碼（Vue 元件、頁面）
│   ├── app.vue         ← 根元件
│   ├── components/
│   └── pages/          ← 檔案路由：pages/foo.vue → /foo
├── content/            ← Markdown 內容（Nuxt Content 自動讀這裡）
│   ├── about.md
│   └── index.md
├── content.config.ts   ← Nuxt Content 的設定（可定義 collection schema）
├── nuxt.config.ts      ← Nuxt 主設定檔
├── package.json
├── public/             ← 靜態檔（圖片、favicon 等）
├── README.md
└── tsconfig.json       ← TypeScript 設定（Nuxt 4 預設啟用 TS）
```

### 與 Vue + Vite 專案的差異（給 Vue 工程師的對照）

| Vue + Vite | Nuxt |
|---|---|
| `src/` | `app/`（Nuxt 4 後）|
| `src/main.ts` 手動 mount | 沒有，框架幫你做 |
| `vue-router` 自己設路由 | `pages/` 檔案即路由 |
| `index.html` | `app.vue` |
| 沒有內建 SSR | 預設 SSR，可切 SPA / SSG |

---

## Step 3：初始 `package.json` 看點

```json
{
  "name": "site",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",      // 生產 build（SSR）
    "dev": "nuxt dev",          // 開發伺服器
    "generate": "nuxt generate", // 純靜態網站 (SSG)
    "preview": "nuxt preview"    // 本地預覽 build 結果
  },
  "dependencies": {
    "@nuxt/content": "^3.13.0",  // Markdown 內容系統
    "nuxt": "^4.4.4"             // 注意：拿到的是 Nuxt 4 而不是 3
  }
}
```

> 💡 **關鍵發現**：2026 年初 `nuxi@latest` 已經是 Nuxt 4。網路上多數教學是 Nuxt 3，差異點要留意（最大的就是 `app/` 目錄結構）。

---

## Step 4：初始 `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
  ],
  devtools: { enabled: true },     // Nuxt DevTools（瀏覽器內的除錯面板）
  compatibilityDate: '2024-04-03', // 鎖定某天的 Nuxt 行為，避免升級破壞
})
```

`compatibilityDate` 是 Nuxt 比較新的概念：**框架升級時，行為以這個日期為準**，可以無痛升版本但不破壞既有專案。

---

## Step 5：安裝依賴

```bash
cd site
npm install
```

我這次裝了 **838 packages，耗時約 2 分鐘**。

---

## Step 5.5：踩坑紀錄 — `better-sqlite3` 與 TTY 錯誤

第一次跑 `npm run dev` 時噴了兩條錯誤：

```
[@nuxt/content] ERROR Nuxt Content requires better-sqlite3 module to operate.
ERROR TTY initialization failed: uv_tty_init returned EBADF (bad file descriptor)
```

兩條錯誤其實是**一個根因 + 一個連鎖反應**。

### 根因：Nuxt Content v3 用 SQLite 當內容索引

Nuxt Content v2 用 JSON / 記憶體索引，內容多了會慢、記憶體會吃緊、複雜查詢做不到。
v3 改用 **SQLite**：`.md` 解析後寫入 `.data/content/contents.sqlite`，查詢時用 SQL。

好處：
- 查詢快（有 index）
- 支援 frontmatter 做複雜過濾（`where` / `orderBy` / `limit`）
- production build 後是個可攜帶的 sqlite 檔，部署時直接帶走

### 為什麼是 `better-sqlite3` 而不是 `sqlite3`？

| 套件 | API | 速度 | 安裝難度 |
|---|---|---|---|
| `sqlite3` | callback / async | 較慢 | 簡單 |
| `better-sqlite3` | **同步**（但快到不需要 async） | 2–3x 快 | 需要 native build |

Content v3 選 `better-sqlite3`，因為內容索引是 **build-time / dev-time** 操作，不是 request handler，同步 API 更直觀也更快。

### 為什麼官方模板不預裝？

Nuxt Content v3 支援多種 SQLite 後端：

- `better-sqlite3`（Node 環境，最快）
- `node:sqlite`（Node 22+ 內建，實驗性）
- `@libsql/client`（Cloudflare、邊緣運算用）
- 雲端模式（NuxtHub 的遠端 DB）

模板**不預設綁定**任何一個，第一次跑時用互動式 prompt 問你要哪個。立意是彈性，但對新手不友善。

### 連鎖反應：TTY 錯誤怎麼來的

當缺 `better-sqlite3` 時，Nuxt Content 不直接 fail，而是想用 `consola` 互動式問「要不要幫你裝？」。
這個 prompt 需要 **TTY**（真實終端機）才能讀鍵盤輸入。

在 **CI / AI 自動化 / 背景 process** 等非 TTY 環境，stdout/stderr 是 pipe 不是 TTY → `uv_tty_init` 回傳 `EBADF` → process 崩掉。

> 🔑 **關鍵觀察**：手動在 terminal 跑會看到 prompt 按 Y 就過了，這個「坑」不會出現。**這是 AI / CI 環境特有的問題**。`consola` 沒有降級成「請手動執行 X」的 fallback，是工具層面的設計缺陷。

### 解法

實際上的修法只有一個——**手動把缺的依賴裝起來**：

```bash
npm install better-sqlite3
```

> 補充：Nuxt Content v3 也支援 Node 22+ 內建的 `node:sqlite`，可在 `nuxt.config.ts` 切換後端、避免 native build。但這是「**換一條路繞過坑**」，不是「**修這個坑**」，性質不同。

### 真正的教訓：AI 模式下要預先建立反饋與斷點機制

如果你是手動跑這條指令，看到 prompt 按 Y 就過了，根本不會察覺有問題。
這個坑只在「**讓 AI 代跑、process 沒有 TTY**」時才會炸——而 2026 的開發工作流越來越多 AI 介入，這類情境只會變多。

值得固化下來的協作原則：

1. **可預期會跳互動 prompt 的指令**（`npm run dev`、各種 `init` / `setup` / `migrate`）：先讓 AI 在前景跑、暴露輸出，看到 prompt 就停下來問人，不要直接背景化
2. **AI 遇到非預期錯誤時要主動報告 + 斷點**：不要自己猜解法瞎試，先把錯誤訊息、可能根因、建議方向丟給人決定
3. **修好後要回頭補紀錄**：踩坑當下的脈絡是最值錢的內容，過幾天就忘了——這也是這份筆記存在的理由

---

## Step 6：啟動 dev server

```bash
npm run dev
```
