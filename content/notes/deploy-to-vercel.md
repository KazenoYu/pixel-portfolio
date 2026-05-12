---
title: 把 Nuxt 4 部署到 Vercel — 完整流程與一個 SSR 踩坑
description: 從 GitHub repo 推送到 Vercel 自動部署的完整路徑，附 Nuxt Content v3 在 serverless 環境下的 SQLite 404 踩坑與 prerender 解法。
date: 2026-05-12
tags: [vercel, nuxt, deploy, ci-cd]
readMin: 12
draft: false
---

這篇紀錄一個 Nuxt 4 + Nuxt Content 專案從本機到公網的完整部署路徑。內容包含 Vercel 是什麼、為什麼選它、實作步驟，以及一個只有在 serverless 環境才會炸的踩坑（本機跑得起來不代表 Vercel 跑得起來）。

## 為什麼選 Vercel

Vercel 是 Next.js 作者創立的公司，所以對前端 SSR 框架（Next、Nuxt、SvelteKit、Astro）的支援是業界最好的。對 Nuxt 4 來說「**幾乎零設定**」——它會自動偵測 `nuxt.config.ts`、套用對應 preset、把 `.output/public/` 丟 CDN、把 `.output/server/` 包成 serverless function。

免費方案對個人 Portfolio 完全夠用：

| 額度 | 數字 |
|---|---|
| 流量 | 100 GB / 月 |
| Build minutes | 6000 / 月 |
| Preview deployments | 無限 |
| 自訂 domain | 可綁，免費 SSL |

替代品也很多——Cloudflare Pages 流量無限、Netlify 與 Vercel 接近——但對 Nuxt 來說 Vercel 最順。

## 部署的本質：自動化 build + CDN

寫成圖比較好懂：

```
你的電腦                GitHub                    Vercel
─────────              ────────                  ──────────
git push   ──────►   pixel-portfolio  ──webhook─►   build runner
                                                       │
                                                       ▼
                                                   npm install
                                                       │
                                                       ▼
                                                   npm run build
                                                       │
                                                       ▼
                                            ┌────────┴────────┐
                                            ▼                 ▼
                                       .output/public    .output/server
                                            │                 │
                                            ▼                 ▼
                                       全球 CDN          Serverless Fn
                                            │                 │
                                            └────────┬────────┘
                                                     ▼
                                            https://*.vercel.app
```

**關鍵概念**：你 push 到 GitHub 觸發 webhook → Vercel 跑 build → 產出靜態檔丟 CDN、動態邏輯包成 serverless function。你只管寫 code，**push 就上線**。

## 前提

開始前確認：

- [x] 一個能在本機跑起來的 Nuxt 4 專案
- [x] GitHub 帳號 + SSH key 已設定好（或使用 HTTPS）
- [x] Vercel 帳號（用 GitHub 登入最快）

## Step 1：本機 build 驗證

部署前先確認 production build 沒問題。dev 跑得起來不等於 build 能過——SSR hydration、`import.meta.client`、native module 等議題只有 build 才會浮現。

```bash
cd site
npm run build
```

看到類似這樣的輸出就 OK：

```
✔ Nuxt module loaded
✔ Vite client built
✔ Vite server built
✔ Nuxt Nitro server built
Σ Total size: 1.2 MB
```

任何紅字訊息都要修完才能部署，否則只是把問題搬到雲端再炸一次。

## Step 2：推到 GitHub

在 GitHub 建立空的 repo（**不要勾選任何初始檔案**，包括 README / .gitignore），拿到 SSH URL。

接著本機初始化：

```bash
cd site
git init -b main
git add -A
git commit -m "Initial commit"
git remote add origin git@github.com:你的帳號/你的repo.git
git push -u origin main
```

> ⚠️ **路徑陷阱**：如果你跟我一樣專案在 `Portfolio/site/`，要在 `site/` 內 `git init`，不要在 `Portfolio/` 根目錄做。否則會把 30+ 個設計探索 HTML 跟整個工作區都吸進 repo。

推上去後到 GitHub 確認檔案數正確。我這次是 20 個檔案，沒有 `node_modules`、`.nuxt`、`.output` 那才對。

![GitHub repo 推送完成的樣子](/notes-images/deploy-to-vercel/step-2-github.png)

## Step 3：到 Vercel 匯入 repo

打開 [vercel.com/new](https://vercel.com/new)，用 GitHub 登入。

如果是第一次使用，會跳一個授權頁問你「Vercel 可以存取哪些 repo」。建議選 **All repositories** 比較省事，之後新建任何 repo 都能直接部署。

![Vercel /new 頁面看到的 repo 列表](/notes-images/deploy-to-vercel/step-3-import-list.png)

在 repo 清單裡找到剛推上去的那個，按右側 **Import**。

## Step 4：確認框架偵測與設定

進到 Configure Project 頁，Vercel 應該已經自動：

- **Framework Preset**：Nuxt
- **Build Command**：`nuxt build`（會自動填）
- **Output Directory**：`.output/public`（會自動填）
- **Install Command**：`npm install`

![Vercel 偵測到 Nuxt + 自動填好 build 設定](/notes-images/deploy-to-vercel/step-4-framework.png)

**Root Directory** 要特別注意：如果你的 Nuxt 專案在 repo 根目錄就用預設 `./`；如果在子資料夾（例如我這次在 `site/`，但 repo 內容**就是** `site/` 的內容），那也是 `./`。只有當 repo 是 monorepo 結構才會需要設成子路徑。

如果這個專案有 `.env` 變數（API key 等），點 **Environment Variables** 加進去。我這次沒有，跳過。

確認沒問題後按最下方 **Deploy**。

## Step 5：首次部署

Vercel 開始跑 build。整個過程大概 1-3 分鐘，能看到實時 log：

![Vercel 首次 build 進行中的 log 畫面](/notes-images/deploy-to-vercel/step-5-build.png)

build 成功會看到大大的 🎉 動畫，給你部署 URL（格式類似 `*.vercel.app`）。

![部署完成的 Vercel dashboard](/notes-images/deploy-to-vercel/step-5-deployed.png)

打開 URL 看主頁——應該長得跟本機一樣。

## 但筆記頁 404 ⚠️

我這次 deploy 完打開主頁是好的，但點任一篇筆記都跳 404。回頭看主頁底下顯示「森林裡還沒有任何筆記」——明明本機正常顯示 5 篇。

`curl` 幾條路由佐證：

```bash
curl -o /dev/null -w "%{http_code}\n" https://YOUR.vercel.app/
# 200

curl -o /dev/null -w "%{http_code}\n" https://YOUR.vercel.app/preview
# 200  (preview 用假資料，所以正常)

curl -o /dev/null -w "%{http_code}\n" https://YOUR.vercel.app/about
# 404

curl -o /dev/null -w "%{http_code}\n" https://YOUR.vercel.app/notes/learning-nuxt-init
# 404
```

**`/preview` 通、其他依賴 `queryCollection` 的全部 404** ← 這個 pattern 直接指向 Nuxt Content 在 serverless 環境讀不到資料庫。

### 根因：SQLite 跑不進 serverless

Nuxt Content **v3** 改用 SQLite 當內容索引，需要 `better-sqlite3` 這個 native 模組。本機跑 dev 時，Nuxt 直接從 `.data/content/contents.sqlite` 讀。問題是：

1. **`.data/` 不會被打包進 serverless function**：Vercel 的 function bundle 只包 `.output/server/`
2. **`better-sqlite3` 是 native binary**：本機編譯的是 Windows 版，丟到 Vercel 的 Linux 環境也不一定能直接用

結果就是：function 啟動了，但 query 不到任何 `.md` 內容，全部 404。

### 解法：prerender（靜態預渲染）

對「內容低頻更新」的 Portfolio / Blog，**最乾淨的解法是 build 時就把每篇筆記烤成靜態 HTML**：

- queryCollection 在 build 階段執行（本機 / Vercel build runner 都讀得到 SQLite）
- runtime 不需要 SQLite，純 CDN 服務
- 速度更快、零 cold start、流量便宜

在 `nuxt.config.ts` 加：

```ts
export default defineNuxtConfig({
  // ... 其他設定
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about'],
      failOnError: false,
    },
  },
})
```

逐項解釋：

- `routes: ['/', '/about']` — build 的起點頁面
- `crawlLinks: true` — 從起點頁開始爬，跟著所有 `<NuxtLink>` 走訪，自動發現 `/notes/learning-nuxt-init`、其他筆記等
- `failOnError: false` — 個別頁失敗（例如 404）不擋整體 build

存檔後 push：

```bash
git add nuxt.config.ts
git commit -m "fix: prerender content routes for Vercel deploy"
git push
```

Vercel 收到 push 後自動 redeploy，1-2 分鐘後筆記頁就活了。

![Redeploy 完成、筆記頁正常顯示](/notes-images/deploy-to-vercel/step-9-fixed.png)

### 教訓：本機 dev ≠ production 部署環境

這個坑根本上是兩件事：

1. **dev 環境的「免費假設」**會在 production 失效。Dev server 自由存取整個檔案系統，serverless function 只能用打包進來的東西
2. **Native modules（C++ 寫的 npm 套件）跨平台不可靠**。本機編譯的二進位丟到別的 OS 通常要重新編譯

> **每次採用會在 build 時做特殊事情的套件（Nuxt Content、Prisma、image processing 等），都要問一句：「production 怎麼跑？」** 不問的話，部署到一半才發現是常事。

## 之後每次更新

設定完成後，**push GitHub = 自動 redeploy**。流程簡化成：

```bash
# 寫完一篇新筆記後
git add content/notes/your-new-note.md
git commit -m "add: new note about X"
git push
# Vercel 自動 build + 部署，1-2 分鐘後上線
```

每次 push 也會自動產一個 **Preview Deployment**（給非 main branch 用）——你可以開個 PR 看別的 URL 預覽改動，確認 OK 再 merge 到 main 才真的更新正式站。

## 自訂 Domain（可選）

Vercel 給的 `*.vercel.app` 雖然能用，但個人站還是綁自己網域好看。流程：

1. 買 domain（Cloudflare / Namecheap / Google Domains 都行）
2. Vercel 後台 → Project → Settings → Domains → Add
3. Vercel 給你 DNS 紀錄（一條 `A` 或 `CNAME`）
4. 到你的 domain provider 那邊加上對應紀錄
5. 等 DNS 傳遞（通常 5-30 分鐘）

SSL 憑證 Vercel 自動處理，不用碰。

## 結語

這次的踩坑訊號其實**第一秒就明顯了**：

- `/preview`（不依賴 DB）通
- 其他（依賴 DB）全 404

兩者的差別不是 client / server，是「**有沒有讀 SQLite**」。一旦看清這條分界，prerender 解法是直接推導出來的——既然 build 時讀得到、runtime 讀不到，那就**讓 build 時把答案算完**。

部署沒有想像中複雜。複雜的是「本機跑得起來 vs production 跑得起來」之間那道隱形邊界，多踩幾次就會內化了。
