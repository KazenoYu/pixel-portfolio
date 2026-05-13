---
title: Prisma vs Drizzle — 兩個 ORM 的取捨，與「SQL 透明度」這件事
date: 2026-05-13
description: 同樣的 query 在 Prisma 和 Drizzle 寫起來差很多。差異不是語法，而是「你看不看得到背後產生的 SQL」。這篇拆兩者對 CRUD、複雜報表、型別安全的真實差異。
tags: [orm, prisma, drizzle, typescript, sql]
readMin: 8
draft: false
---

選 ORM 時最常聽到的問題是「哪個比較快」或「哪個比較流行」。但對我來說真正的分水嶺是另一件事——**你看不看得到 SQL**。

對寫個人專案或 demo 來說無所謂，**對寫長期維運的商業系統來說，這個差異會放大到「系統效能能不能調」的層級**。這篇用同一段邏輯比較兩個 ORM 的具體差異。

## 同一件事，三種寫法

### 查詢：找出價格 > 100 的商品

```sql
-- 原始 SQL
SELECT id, name, price FROM products WHERE price > 100 ORDER BY price DESC;
```

```typescript
// Prisma — 用物件描述「你要什麼」，完全不碰 SQL
const products = await prisma.product.findMany({
  where: { price: { gt: 100 } },
  orderBy: { price: 'desc' },
  select: { id: true, name: true, price: true },
});
```

```typescript
// Drizzle — 寫法貼近 SQL：.select().from().where() 對應 SELECT...FROM...WHERE
const products = await db
  .select({ id: products.id, name: products.name, price: products.price })
  .from(products)
  .where(gt(products.price, 100))
  .orderBy(desc(products.price));
```

簡單 CRUD 兩者都行——Prisma 寫起來更短，Drizzle 結構性更強。**真正的差異要看複雜場景。**

## SQL 透明度比較

### Prisma：抽象層很高，不知道背後產生了什麼 SQL

```typescript
// 這個查詢背後可能產生 4 條以上的 SQL，你看不到
const order = await prisma.order.findUnique({
  where: { id: 1 },
  include: {
    items: { include: { product: true } },
    customer: true,
    payments: true,
  },
});
// 如果某條慢了，你不知道是哪一條
```

Prisma 把多表關聯的細節封裝起來，**寫起來很順但 debug 困難**。production 上某個 query 慢了，要先 reverse engineer 它產生了什麼 SQL，才能下手調優。

### Drizzle：寫法本身就是 SQL

```typescript
// 一眼就知道：一條 SQL，JOIN 了 4 張表
const order = await db
  .select()
  .from(orders)
  .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
  .innerJoin(products, eq(products.id, orderItems.productId))
  .innerJoin(customers, eq(customers.id, orders.customerId))
  .leftJoin(payments, eq(payments.orderId, orders.id))
  .where(eq(orders.id, 1));
```

寫的時候你**就知道**會產生什麼 SQL。Drizzle 的 API 設計是「**SQL 的 builder**」而不是「**抽象層**」——寫起來不那麼乾淨，但你永遠掌握全局。

### Prisma 也能看到 SQL（但要主動開）

公平起見：Prisma 也可以看到實際 SQL，只是需要開 query log。

```typescript
// 開啟 query log
const prisma = new PrismaClient({ log: ['query'] });
// 之後每個操作都會印出實際 SQL：
// prisma:query SELECT "id", "name", "price" FROM "products" WHERE "price" > $1
```

dev 環境開來看沒問題，但**production 怕 log 量過大、影響效能**——通常開不起來。也就是說，最需要看 SQL 的時候（線上系統爆掉那一刻）你常常看不到。

## 複雜報表場景：差異放大

### 範例：各類別本月營業額

```typescript
// Prisma — groupBy 功能有限，複雜聚合要在 JS 裡手動算，或用 $queryRaw
const items = await prisma.orderItem.findMany({
  where: { createdAt: { gte: startOfMonth } },
  include: { product: { include: { category: true } } },
});
// 10 萬筆全部載入記憶體再手動聚合 → 慢、吃記憶體
```

或者退回到 raw SQL：

```typescript
// 用 $queryRaw 寫原始 SQL（失去型別安全，回傳 unknown）
const report = await prisma.$queryRaw`
  SELECT c.name, SUM(oi.price * oi.quantity) as total
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE oi.created_at >= ${startOfMonth}
  GROUP BY c.name ORDER BY total DESC
`;
```

`$queryRaw` 不錯，但是**失去了 ORM 給你的型別安全**——回傳是 `unknown`，要手動 cast。

### Drizzle：一條查詢搞定，保留型別安全

```typescript
const report = await db
  .select({
    category: categories.name,
    total: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`,
  })
  .from(orderItems)
  .innerJoin(products, eq(products.id, orderItems.productId))
  .innerJoin(categories, eq(categories.id, products.categoryId))
  .where(gte(orderItems.createdAt, startOfMonth))
  .groupBy(categories.name)
  .orderBy(desc(sql`total`));
// 回傳型別自動推斷成 { category: string, total: number }[]
```

複雜的聚合與 JOIN 是 Drizzle 的強項，**寫得跟 SQL 一樣靈活，型別還自動推斷**。

## 總結比較

|  | Prisma | Drizzle |
|---|---|---|
| **簡單 CRUD** | 更直覺好讀 | 稍微囉嗦 |
| **複雜報表** | 需退回 `$queryRaw` | 強項 |
| **SQL 可見度** | 需開 log 才看到 | 寫法本身就是 SQL |
| **型別安全** | 需 `prisma generate` 同步 | 編譯時自動推斷 |
| **NestJS 整合** | 現成方案多、教學多 | 需手動設定 |
| **社群資源** | 豐富（2019 起） | 成長中（2022 起） |
| **套件大小** | 較大 | ~7.4KB 極輕 |

## 怎麼選？

不是「哪個更好」，是**「你目前最痛的點是什麼」**：

| 情境 | 推薦 |
|---|---|
| 你的團隊 SQL 基礎弱，要快速做 CRUD | **Prisma**（高抽象，省 SQL 學習成本） |
| 你做的系統有大量複雜報表 / 聚合 | **Drizzle**（SQL 透明，調優友善） |
| 你已經懂 SQL，想要型別安全又不丟控制權 | **Drizzle** |
| 你正在快速 prototype | **Prisma** |
| 你的團隊有 DBA，會審 query plan | **Drizzle** |

## SQL 調優的學習路徑（不受 ORM 影響）

兩個 ORM 都不該擋你學 SQL——SQL 是資料庫層級的知識，會跟你一輩子：

```
階段 1（開發功能）：用 ORM 的高階 API 快速做 CRUD
階段 2（寫報表）：  寫原始 SQL（Prisma $queryRaw 或 Drizzle）→ 學語法
階段 3（效能調優）：開 query log + EXPLAIN ANALYZE → 學調優
```

```sql
-- EXPLAIN ANALYZE：分析任何 SQL 的效能
EXPLAIN ANALYZE
SELECT * FROM orders WHERE created_at >= '2026-03-01';
-- 告訴你：用了什麼索引、掃描了幾列、花了幾毫秒
```

選 Prisma 不等於「不用學 SQL」——到報表階段一定會碰到。**選 Drizzle 等於更早被推到 SQL 面前**，是好事也是門檻。

## 結語

我自己會根據「**團隊熟悉度 + 系統複雜度**」二維決定：

- 團隊熟 SQL + 系統複雜 → **Drizzle**
- 團隊不熟 SQL + 系統簡單 → **Prisma**
- 中間地帶 → **Prisma 起手，遇到性能瓶頸再換**

選 ORM 不是宗教戰爭，是「**這個專案這個團隊現在最痛什麼**」的判斷題。
