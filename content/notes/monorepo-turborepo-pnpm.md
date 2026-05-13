---
title: Monorepo 不只是「把東西放一起」 — Turborepo + pnpm 的真正價值
date: 2026-05-13
description: 把前端後端塞同一個 repo 不等於 monorepo。pnpm 解決依賴隔離，Turborepo 解決執行順序與快取，兩個工具各管一塊，加起來才是 monorepo 的完整體驗。
tags: [monorepo, turborepo, pnpm, tooling]
readMin: 6
draft: false
---

「Monorepo 不就是把多個專案放在一個 git repo 嗎？」——剛開始我也這樣想。實際做才發現，沒有對的工具支撐，monorepo 反而比多 repo 痛苦：一鍵裝依賴會把整個世界裝下來、一個 build 指令要等所有 app build 完。

`pnpm` + `Turborepo` 各管一塊，加起來才是體驗良好的 monorepo。

## Monorepo 的結構

前端、後端、共用程式碼全部放在一個 Git repo，但**邏輯上仍然各自獨立**：

```
mono-pos/
├── apps/
│   ├── web/               # 前端（React + Vite）
│   │   └── package.json   # 自己的 dependencies
│   └── api/               # 後端（NestJS）
│       └── package.json   # 自己的 dependencies
├── packages/
│   └── shared-types/      # 共用型別，前後端都引用
│       └── package.json
├── package.json           # 根目錄
├── pnpm-workspace.yaml    # 定義 workspace
└── turbo.json             # Turborepo 設定
```

每個 app / package **有自己的 `package.json`**，依賴清楚分離。

## 為什麼採 Monorepo

對全端開發來說，monorepo 的價值主要在三件事：

1. **型別共享**：後端改了 API 回應格式 → 前端 TypeScript 立刻報錯
2. **驗證一致**：同一套 zod schema 前後端都用，不會兩邊規則不同步
3. **一個 PR 同時 review**：一個功能的前後端改動在同個 PR，邏輯完整

這三件事沒有 monorepo 也能做，但**會非常痛苦**（npm link 來 link 去、版本對不上、PR 跨 repo review）。

## pnpm — 管「安裝依賴」

### 隔離 + 共享：兩個聽起來矛盾的需求

monorepo 的依賴管理有個雙重需求：

- **隔離**：每個 app 有自己的依賴清單，不互相污染
- **共享**：同名同版本套件不要重複下載 N 次

pnpm 用 **content-addressable store + symlink** 同時滿足兩個。

### 指定 app 安裝套件

```bash
pnpm add react --filter web              # 只裝到 apps/web
pnpm add @nestjs/core --filter api       # 只裝到 apps/api
pnpm add zod --filter shared-types       # 裝到 packages/shared-types
```

`--filter` 是 pnpm 的核心 flag——讓你針對特定 workspace 操作，不會影響別人。

## Turborepo — 管「執行指令」

### 核心三大功能

**1. 依賴分析** — 自動知道執行順序

```
web 依賴 shared-types → shared-types 要先 build
api 依賴 shared-types → shared-types 要先 build
```

你不用手動寫「先 build A 再 build B」，Turborepo 看 `dependsOn` 自己排序。

**2. 平行執行** — 沒有依賴關係的任務同時跑

```
shared-types build 完成後：
web build ──┐
            ├── 同時進行
api build ──┘
```

兩個獨立的 app build 同時跑，總時間是「最慢的那個」而不是「全部相加」。

**3. 快取** — 沒改的部分跳過

```
pnpm build 輸出：
shared-types:build  executing... done (0.8s)   ← 有改動，重新 build
web:build           cache hit ✅                ← 沒改，跳過
api:build           cache hit ✅                ← 沒改，跳過
```

第二次 build 整個專案，**沒動過的 app 直接讀快取**，秒回。

### 一個指令啟動所有 dev server

```bash
pnpm dev
# web  → localhost:5173
# api  → localhost:3000
```

兩個 process 並行，console 輸出自動標 prefix，看得出哪行 log 是哪個服務的。

## 共用 packages 怎麼引用

```typescript
// packages/shared-types/index.ts
export interface Product {
  id: number;
  name: string;
  price: number;
}

// apps/web（前端）
import type { Product } from '@mono-pos/shared-types';

// apps/api（後端）
import type { Product } from '@mono-pos/shared-types';

// 改了 Product 型別 → 前後端同時 TypeScript 報錯
```

**單一事實來源**——後端傳回給前端的 JSON 跟前端期待的型別永遠對得起來，不會有「我以為後端會回 `price: number` 但它回 `price: string`」的悲劇。

## 職責分工總覽

```
pnpm        → 管「安裝依賴」（誰需要什麼套件）
Turborepo   → 管「執行指令」（順序、平行、快取）
```

兩個工具職責清楚不重疊：

- 沒有 pnpm，依賴管理會回到 npm 那種「全部裝進根目錄」的混亂
- 沒有 Turborepo，每次 build / dev 都要等所有 app，沒快取
- **少了任何一個都會大幅降低 monorepo 體驗**

## 結語

Monorepo 不是「把專案搬到同一個 repo」就完事的——那只是第一步，沒有工具支援的話比多 repo 還難用。pnpm 解決依賴問題、Turborepo 解決執行問題，兩個加起來才有那種「**一鍵 dev、一鍵 build、改一處全站立刻知道**」的舒服體驗。

下次評估要不要做 monorepo，**先看你的工具鏈準備好了沒**——這比討論「要不要 monorepo」本身更實際。
