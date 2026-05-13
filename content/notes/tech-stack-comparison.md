---
title: 全棧技術選型 — 12 個維度的取捨筆記
date: 2026-05-13
description: 從前端框架到部署工具，把一個全端系統的 12 個技術選擇逐項拆開比較，並附上我會這樣選的理由。不是給「最好的答案」，是給「怎麼想」。
tags: [architecture, tech-stack, decision-making, fullstack]
readMin: 22
draft: false
---

每次開新專案最容易迷失的時刻，是「**技術棧選型**」這一步。社群熱潮、行業流行、最新發表的框架——資訊太多但通通不告訴你「**對你的專案來說哪個對**」。

這篇是我做一個全端系統（POS / ERP 為例）時，逐項評估 12 個技術維度的筆記。不是「最好的組合」——**因為這個東西不存在**——而是把選擇的依據攤開。看完你可以照抄、可以反對、但至少知道我為什麼這樣選。

## 目錄

1. 前端框架
2. 後端框架
3. 資料庫
4. ORM
5. API 設計風格
6. UI 元件庫
7. 狀態管理
8. 認證與授權
9. 測試工具
10. Monorepo 工具
11. 部署與 DevOps
12. 即時通訊
13. **最終組合**

---

## 1. 前端框架

| 項目 | React 19 | Vue 3 | Next.js 15 | Angular 19 |
|---|---|---|---|---|
| **一句話** | Facebook 開發的 UI 函式庫 | 漸進式框架，學習曲線平滑 | React 的全端框架 | Google 的企業級框架 |
| **學習難度** | ⭐⭐⭐ 中 | ⭐⭐ 易 | ⭐⭐⭐⭐ 較難 | ⭐⭐⭐⭐⭐ 最難 |
| **生態系** | 最豐富 | 豐富，中文社群活躍 | 繼承 React 生態 | 自帶完整方案 |
| **就業市場** | 🥇 最高 | 🥈 第二 | 🥇 與 React 並列 | 🥉 第三 |
| **適合場景** | 各種規模 | 中小型、原型 | 需要 SSR/SEO | 大型企業 |

### 推薦：React 19 + Vite

理由：

1. **生態最大**：幾乎任何功能都有現成套件
2. **就業價值最高**：全球 React 職缺遠多於其他框架
3. **Vite 是新標準**：取代 CRA，啟動毫秒級
4. **TypeScript 體驗最好**：React + TS 是業界最成熟組合

**為什麼不選 Next.js？** Next 是 React 的全端框架，包含 SSR。如果後端用 NestJS（更專業），就不需要 Next 的後端能力——用 React + Vite 反而更輕量靈活。

> SSR vs CSR 的詳細決策框架，見另一篇筆記。

---

## 2. 後端框架

| 項目 | NestJS | Express | Fastify | Hono |
|---|---|---|---|---|
| **一句話** | 企業級 Node 框架（靈感來自 Angular） | 最老牌的 Node 框架 | 高效能 Node 框架 | 超輕量邊緣運算框架 |
| **學習難度** | ⭐⭐⭐⭐ 較難 | ⭐⭐ 易 | ⭐⭐⭐ 中 | ⭐⭐ 易 |
| **架構** | 高度結構化 | 自由放任 | 與 Express 類似 | 極簡 |
| **TypeScript** | 原生支援，一等公民 | 需手動設定 | 良好 | 原生支援 |
| **內建功能** | DI、Guards、Pipes、Interceptors、Swagger | 幾乎沒有 | 基本 | 幾乎沒有 |

### 推薦：NestJS

理由：

1. **模組化**：大型商業系統的每個模組自然對應 NestJS 的 Module
2. **依賴注入**：程式碼容易測試與維護，是企業級開發的關鍵
3. **內建安全機制**：Guards / Pipes 開箱即用
4. **自動 API 文件**：加幾個裝飾器就出 Swagger，作品集展示利器
5. **學習價值高**：DI / 裝飾器 / 模組化是後端開發的核心概念

> NestJS 的請求生命週期與各角色職責，見另一篇筆記。

---

## 3. 資料庫

| 項目 | PostgreSQL | MySQL | MongoDB | SQLite |
|---|---|---|---|---|
| **類型** | 關聯式 | 關聯式 | 文件式 | 關聯式（單檔案） |
| **適合場景** | 金融、ERP、複雜查詢 | Web 應用、WordPress | 靈活文件結構 | 行動裝置、小型應用 |
| **ACID** | ✅ 完整 | ✅ 完整 | ⚠️ 有限 | ✅ 完整 |
| **JSON 支援** | ✅ JSONB（超強） | ⚠️ 基本 | ✅ 原生 | ⚠️ 基本 |

### 推薦：PostgreSQL

涉及金錢交易的系統，**資料一致性是第一優先**：

1. **ACID 合規**：「轉帳一半斷電」不會造成金額不一致
2. **關聯式結構**：訂單—商品—類別—折扣，關係用表格最自然
3. **JSONB**：需要存半結構化資料時比 MongoDB 更安全
4. **報表查詢強大**：ERP 大量統計報表，SQL 功能最完整

#### 什麼是 ACID

- **A**tomicity：交易要嘛全成功，要嘛全失敗
- **C**onsistency：資料永遠處於合法狀態
- **I**solation：多人同時操作不會互相干擾
- **D**urability：寫入成功就不會丟失

### 輔助資料庫：Redis

| 用途 | 說明 |
|---|---|
| 快取 | 常查的資料暫存在記憶體，比查資料庫快 10–100 倍 |
| Session 儲存 | 使用者登入狀態 |
| 即時訊息 | Pub/Sub 機制，用於跨伺服器通訊 |
| 速率限制 | 防止 API 被惡意大量呼叫 |

---

## 4. ORM

| 項目 | Drizzle | Prisma | TypeORM |
|---|---|---|---|
| **一句話** | 輕量、SQL 透明的新興 ORM | 最流行的 TypeScript ORM | 老牌企業級 ORM |
| **學習難度** | ⭐⭐⭐ 中 | ⭐⭐ 易 | ⭐⭐⭐⭐ 較難 |
| **SQL 透明度** | 🥇 看得到實際 SQL | 🥉 高度抽象 | 🥈 中 |
| **套件大小** | ~7.4KB | 較大 | 較大 |
| **複雜查詢** | 🥇 貼近 SQL，彈性高 | 🥉 受限 | 🥈 中 |

### 推薦：Drizzle ORM

1. **SQL 透明**：永遠知道產生了什麼 SQL，對金融系統效能調優至關重要
2. **學 SQL 的好機會**：API 貼近 SQL 語法，邊用邊學
3. **零額外執行時依賴**：打包後極小
4. **複雜統計查詢比 Prisma 直覺**

**Prisma 也不錯**：如果偏好更高階抽象、更成熟的生態、更好的 NestJS 整合。

> Prisma vs Drizzle 的逐項比較，見另一篇筆記。

---

## 5. API 設計風格

| 項目 | REST | GraphQL | tRPC |
|---|---|---|---|
| **學習難度** | ⭐⭐ 易 | ⭐⭐⭐⭐ 較難 | ⭐⭐⭐ 中 |
| **業界普及度** | 🥇 最高 | 🥈 第二 | 🥉 新興 |
| **型別安全** | ❌ 需手動 | ⚠️ 需 codegen | ✅ 自動推斷 |
| **彈性** | 固定回應結構 | 前端決定要哪些欄位 | TS 型別共享 |
| **外部整合** | 🥇 最容易 | 🥈 良好 | 🥉 限 TS |

### 推薦：REST + Swagger

1. **業界標準**：所有公司都用，面試必備
2. **NestJS 原生支援**：加裝飾器自動生 Swagger 文件
3. **與支付系統相容**：Stripe / Square 等支付 API 都是 REST
4. **作品集展示**：Swagger UI 讓面試官直接測試 API

GraphQL 強大但對單一前端的後端來說 overkill；tRPC 在純 TS 全棧很順，但失去多語言整合彈性。

---

## 6. UI 元件庫

| 項目 | Shadcn/ui | Ant Design | MUI | Mantine |
|---|---|---|---|---|
| **設計風格** | 極簡、可高度自訂 | 企業風格 | Google Material | 現代簡潔 |
| **安裝方式** | 複製原始碼到專案 | npm | npm | npm |
| **自訂難度** | ⭐ 超易（你擁有原始碼） | ⭐⭐⭐ 中 | ⭐⭐⭐⭐ 較難 | ⭐⭐ 易 |
| **搭配** | Tailwind | Less / CSS-in-JS | Emotion | CSS Modules |

### 推薦：Shadcn/ui + Tailwind CSS

1. **你擁有原始碼**：不是黑盒子，可以看到每個元件怎麼做，學習價值最高
2. **Tailwind**：目前最流行的 CSS 方案
3. **極度靈活**：不同 app（POS vs ERP）的風格需求差異大時可完全自訂
4. **生態活躍**：當前最受歡迎的 React UI 方案

**Ant Design** 是備選——如果想要更完整的企業元件（樹狀圖、複雜表格、流程圖）、不想花時間自訂設計。

---

## 7. 狀態管理

| 項目 | Zustand | Redux Toolkit | Jotai | TanStack Query |
|---|---|---|---|---|
| **一句話** | 超輕量狀態管理 | 最老牌 | 原子化 | 伺服器資料管理 |
| **學習難度** | ⭐ 超易 | ⭐⭐⭐ 中 | ⭐⭐ 易 | ⭐⭐⭐ 中 |
| **適合場景** | 前端 UI 狀態 | 複雜全域狀態 | 細粒度響應 | 從 API 來的資料 |

### 推薦：Zustand + TanStack Query

**這兩個解決不同問題，常常一起用**：

**Zustand** 管「前端自己的狀態」：
- 側邊欄開 / 關
- 選中了哪個商品
- 表單暫存資料

**TanStack Query** 管「從伺服器來的資料」：
- 自動快取、自動更新、自動 retry
- 不用手動寫 loading / error / data 狀態機

```typescript
// Zustand：管理側邊欄
const useSidebarStore = create((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

// TanStack Query：抓取產品列表
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.getProducts(),
});
```

把「**伺服器資料**」用全域狀態管理（Redux / Zustand）去管，是 2020 之前的舊做法。現在的最佳實踐是讓專門的工具處理：TanStack Query 之於資料快取，就像 Vue Router 之於路由——專人專事。

---

## 8. 認證與授權

**先分清楚兩個概念**：

- **認證（Authentication）**：你是誰（登入）
- **授權（Authorization）**：你能做什麼（權限）

### 推薦組合

| 層面 | 工具 | 說明 |
|---|---|---|
| 認證框架 | Passport.js + `@nestjs/passport` | 多種登入方式（帳密、Google、Facebook） |
| Token | JWT | 無狀態的身份驗證令牌 |
| 授權 | CASL | 宣告式的權限控制 |
| 密碼雜湊 | Argon2 | 目前最安全的密碼演算法 |

### JWT 運作

```
1. 使用者登入 → 後端驗證帳密 → 發出 JWT Token
2. 前端每次請求都帶 Token → 後端驗證 → 允許 / 拒絕
3. Token 過期 → 用 Refresh Token 換新的 → 繼續使用
```

> CASL 集中式權限管理的具體用法，見另一篇筆記。

---

## 9. 測試工具

### 測試金字塔

```
          /\
         /  \      E2E（少）
        / e2e \    模擬真實使用者操作
       /------\
      /        \   整合（中）
     / integra- \  多個元件一起測試
    /   tion     \
   /--------------\
  /                \ 單元（多）
 /    unit tests    \ 單一函式 / 元件
/____________________\
```

### 推薦工具

| 層級 | 工具 | 用途 |
|---|---|---|
| 單元測試 | Vitest | 測試單一函式和元件 |
| 元件測試 | React Testing Library | 測試 React 元件行為 |
| API 測試 | Supertest | 測試後端 API 端點 |
| E2E 測試 | Playwright | 模擬真實瀏覽器操作 |
| Mock API | MSW（Mock Service Worker） | 測試中模擬後端回應 |

**為什麼選 Vitest 而不是 Jest？**

- Vitest 比 Jest 快 10 倍（原生 ESM 支援）
- 與 Vite 完美整合
- API 幾乎相同，轉換無痛

Jest 仍然強大，但若你已在 Vite 生態，繼續用 Vitest 沒理由切換。

---

## 10. Monorepo 工具

### Turborepo vs Nx

| 項目 | Turborepo | Nx |
|---|---|---|
| **學習曲線** | ⭐⭐ 平緩 | ⭐⭐⭐⭐ 陡峭 |
| **設定量** | 少 | 多 |
| **功能** | 構建快取 + 任務執行 | 完整開發平台 |
| **適合** | 中小型專案 | 大型團隊、多專案 |
| **推薦搭配** | pnpm workspaces | 內建工作區管理 |

### 推薦：Turborepo + pnpm

- **Turborepo**：快速的構建快取——改了前端只重新構建前端
- **pnpm**：比 npm/yarn 節省磁碟空間（symlink 方式共享依賴）

> Monorepo 的完整 setup 與兩個工具的職責分工，見另一篇筆記。

---

## 11. 部署與 DevOps

### 部署流程概觀

```
寫程式碼 → Git Push → CI/CD 自動測試 → 構建 Docker Image → 部署到雲端
```

### 推薦工具

| 階段 | 工具 | 說明 |
|---|---|---|
| 容器化 | Docker | 把應用打包成「容器」，任何環境都能跑 |
| 本地編排 | Docker Compose | 一行指令啟動前端+後端+DB+Redis |
| CI/CD | GitHub Actions | 每次 push 自動跑測試和部署 |
| 雲端 | AWS ECS / DigitalOcean | 生產環境部署 |
| 反向代理 | Nginx / Caddy | 處理 HTTPS、負載均衡 |

### Docker 兩個核心概念

```
Docker Image      = 材料包（程式碼 + 依賴 + 執行環境的規格）
Docker Container  = 用材料包啟動的成品（運行中的程式）

docker build  → 把程式碼打包成 Image
docker run    → 用 Image 啟動一個 Container
→ 不管在誰的電腦上，用同一個 Image 都能跑出一樣的結果
```

對個人 portfolio 或 MVP，Vercel / Railway / Fly.io 這類 PaaS 比自己管 Docker 更划算——**等真的需要再學容器**。

---

## 12. 即時通訊

POS / ERP 中需要即時的場景：

- 新訂單送到廚房顯示器
- 庫存低於警戒值的通知
- 多個收銀台之間的商品價格同步
- 後台即時營業額看板

### 推薦：Socket.io（單伺服器）/ + Redis Pub/Sub（多伺服器）

Socket.io 提供雙向即時通訊（WebSocket），NestJS 有官方支援。當系統擴充到多台伺服器時，加 Redis Pub/Sub 在伺服器之間傳遞訊息。

> WebSocket 與 Redis Pub/Sub 的不同層次，見另一篇筆記。

---

## 13. 最終組合 🏆

```
┌─────────────────────────────────────────────────┐
│  Monorepo: Turborepo + pnpm                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  前端 (apps/web, apps/pos-terminal)             │
│  ├── React 19 + Vite 6                          │
│  ├── TypeScript (strict mode)                   │
│  ├── Shadcn/ui + Tailwind CSS                   │
│  ├── Zustand (UI 狀態)                          │
│  ├── TanStack Query (伺服器資料)                 │
│  └── React Router v7                            │
│                                                 │
│  後端 (apps/api)                                │
│  ├── NestJS                                     │
│  ├── TypeScript (strict mode)                   │
│  ├── REST + Swagger                             │
│  ├── Passport.js + JWT + CASL                   │
│  └── Socket.io (即時通訊)                       │
│                                                 │
│  共享 (packages/)                               │
│  ├── Drizzle ORM (資料庫 schema)                │
│  ├── Zod (驗證規則)                             │
│  └── 共用 TypeScript types                      │
│                                                 │
│  基礎設施                                       │
│  ├── PostgreSQL 16+ (主資料庫)                  │
│  ├── Redis 7+ (快取 / Session)                  │
│  ├── Docker + Docker Compose                    │
│  └── GitHub Actions (CI/CD)                     │
│                                                 │
│  品質保證                                       │
│  ├── Vitest + React Testing Library             │
│  ├── Playwright (E2E)                           │
│  ├── ESLint + Prettier                          │
│  └── Husky + commitlint                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 結語

技術選型沒有「對的答案」，**只有「適合你這個專案這個團隊這個階段」的答案**。看到別人的 stack 不要照搬，先問三件事：

1. 他的系統規模跟我一樣嗎？
2. 他的團隊能力跟我一樣嗎？
3. 他的時程壓力跟我一樣嗎？

三題答案不同，技術組合就會不同。這份清單寫的是「**做一個有商業邏輯複雜度、需要長期維運的全端系統，目前我會這樣選**」——不是聖經，是當下的最佳判斷。

每年看一次，發現有的選項已經過時、有的新工具更好用，就更新。**技術選型本身就是個會生鏽的能力**——保持懷疑、保持實驗。
