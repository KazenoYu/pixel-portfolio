---
title: 我的開發原則 — YAGNI、KISS、SRP 與 SDD/TDD 的取捨
date: 2026-05-13
description: 程式碼層級的三個原則（YAGNI、KISS、SRP）解決「不要過度設計」；流程層級的 SDD + 關鍵邏輯 TDD 解決「怎麼推進開發」。加上後端四層架構說明每一層在做什麼。
tags: [principles, architecture, tdd, sdd, backend]
readMin: 10
draft: false
---

工程師寫久了會累積一套「**我覺得這樣比較好**」的習慣。這些習慣有的是踩坑出來的，有的是讀來的，有的是看別人團隊崩盤學到的。

這篇紀錄我目前的工作原則：**程式碼層級的三個基本守則**、**流程層級的 SDD + 關鍵邏輯 TDD**、以及**後端四層架構的職責分工**。這不是「最正確的方式」，而是我目前的最佳實踐——明年回看可能會修。

## 一、程式碼層級原則（寫每一行 code 都要遵守）

### YAGNI — You Aren't Gonna Need It

不要實作**目前不需要**的功能。

```
❌ 「這個商品管理頁面，我先順便加匯出 CSV 功能好了」
✅ 「先完成 CRUD，匯出功能等真的有需求再加」
```

重點不是「永遠不加」，而是**不要提前做**。提前做的壞處：

- 花時間做了可能永遠用不到的東西
- 增加程式碼複雜度，讓之後維護更困難
- 你對未來需求的猜測**通常是錯的**

工程師最容易違反 YAGNI 的時刻是「我覺得未來會用到」——這句話請當警報音。

### KISS — Keep It Simple, Stupid

用最簡單的方案解決問題。

```
❌  為了「未來擴充性」設計三層抽象 + 策略模式
✅  直接寫一個 function 解決當前需求，之後真的需要再重構
```

不是說永遠用最陽春的方式，而是：

- 如果只有一種合理做法 → 直接做
- 如果多種做法差異不大 → 選簡單的
- 如果多種做法差異很大 → **列出選項和 trade-off，再決定**

「簡單」不等於「陽春」——簡單意味著「**之後讀的人能立刻看懂**」。

### SRP — Single Responsibility Principle

一個函式 / 元件 / 模組只做一件事。

```
❌  ProductService 裡同時處理商品 CRUD + 庫存計算 + 報表產生
✅  ProductService    管商品 CRUD
    InventoryService  管庫存
    ReportService     管報表
```

判斷方式：**如果你要用「和」來描述一個模組的職責，就該拆了**。

> 「這個 service 負責商品 CRUD **和** 計算庫存」← 「和」出現了，拆。

## 二、開發流程原則：SDD 為主 + 關鍵邏輯 TDD

### SDD — Schema-Driven Development（先定形狀，再填邏輯）

適合**大部分功能**，特別是 CRUD 和 API 開發。

**核心思路：先把「資料長什麼樣」定清楚，程式碼就是填空題。**

開發順序：

```
1. Schema     → 這個功能需要存什麼資料？定 Prisma / Drizzle model
2. DTO        → API 輸入 / 輸出長什麼樣？定驗證規則
3. Controller → API 路由是什麼？定 URL + HTTP method
4. Service    → 商業邏輯怎麼處理？實作
5. Test       → 寫測試驗證結果
```

#### 為什麼 SDD 適合 POS / ERP 這種系統？

POS / ERP 的核心是**資料**：商品、訂單、庫存、客戶、供應商。
幾乎所有功能都圍繞「**把資料存進去 → 拿出來 → 處理 → 再存回去**」。先定好 Schema，等於先畫好地圖，剩下的就是沿路走。

### TDD — Test-Driven Development（先寫測試，再寫程式碼）

適合**關鍵商業邏輯**，不是所有功能都需要。

**核心思路：先定義「正確的結果」，再寫程式碼讓結果成立。**

開發循環：

```
1. Red      → 寫一個會失敗的測試（定義預期結果）
2. Green    → 寫最少的程式碼讓測試通過
3. Refactor → 整理程式碼，保持測試通過
4. 重複
```

### 什麼時候用 TDD？

| 場景 | 用 TDD？ | 原因 |
|---|---|---|
| 商品 CRUD | ❌ | 簡單 CRUD，SDD 直接做更快 |
| 價格計算（含稅、折扣、四捨五入） | ✅ | 邊界條件多，先定義預期結果更安全 |
| 庫存扣減（併發、不足） | ✅ | 錯了會出大問題，測試先行 |
| 結帳流程（多步驟） | ✅ | 步驟複雜，每一步都需要明確預期 |
| 報表查詢 | ❌ | 輸出格式為主，寫完再補測試即可 |

**判斷標準**：錯了會不會造成業務災難？會的話 TDD，不會的話 SDD。

## 三、後端四層架構

一個 API 請求在後端的完整旅程：

```
前端 fetch('/products', { body: data })
       │
       ▼
  ┌──────────┐    資料長什麼樣？
  │   DTO    │    驗證輸入格式和規則
  └────┬─────┘
       ▼
  ┌──────────┐    誰接收這個請求？
  │Controller│    路由分發，接參數，回結果
  └────┬─────┘
       ▼
  ┌──────────┐    怎麼處理？
  │ Service  │    商業邏輯 + 存取資料庫
  └────┬─────┘
       ▼
  ┌──────────┐    存到哪裡？
  │  Schema  │    資料庫表格結構（Prisma model）
  └──────────┘
```

### Schema — 資料庫的表格定義

告訴資料庫：「這張表有哪些欄位、什麼型別、什麼約束」

```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Decimal
  sku       String   @unique
  stock     Int      @default(0)
  createdAt DateTime @default(now())
}
```

前端類比：像 TypeScript 的 `interface`，定義資料的「形狀」。差別在於 Schema 定義的是**資料庫裡**的形狀，而且會真的建立表格。

### DTO — API 的輸入驗證

Data Transfer Object。定義「**前端應該傳什麼**」，在進入商業邏輯之前就擋掉不合法的輸入。

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;       // 必須是非空字串

  @IsNumber()
  @Min(0)
  price: number;      // 必須 >= 0

  @IsString()
  sku: string;

  @IsInt()
  @IsOptional()
  stock?: number;     // 可選
}
```

為什麼不直接用 Schema？因為 Schema 有 `id`、`createdAt` 等**前端不該傳的欄位**。DTO 只描述「使用者應該傳的部分」。

前端類比：表單 validation（如 Zod / VeeValidate），但**這是後端的安全防線**——前端的驗證可以被繞過，後端的不行。

### Controller — 路由分發

決定「**哪個 URL + HTTP method 對應哪個處理函式**」。只做三件事：接參數、呼叫 Service、回傳結果。

```typescript
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()                            // POST /products
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get(':id')                        // GET /products/123
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }
}
```

**重要規則：Controller 裡不寫邏輯。** 不查資料庫、不做計算、不判斷業務規則。

前端類比：Vue Router 的路由定義。Router 對應頁面元件，Controller 對應處理函式。

### Service — 商業邏輯

所有真正的處理都在這裡：查資料庫、業務規則判斷、計算、錯誤處理。

```typescript
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existing) {
      throw new ConflictException('SKU already exists');
    }
    return this.prisma.product.create({ data: dto });
  }
}
```

前端類比：Pinia store 的 actions。在 actions 裡打 API、處理資料；Service 裡打資料庫、處理邏輯。角色一樣，方向相反。

## 四、前端對照總覽

對前端工程師理解後端最快的捷徑——找對應的前端概念：

| 後端概念 | 職責 | 前端類比 |
|---|---|---|
| **Schema** | 定義資料庫表格結構 | TypeScript `interface` |
| **DTO** | 驗證 API 輸入 | 表單 validation（Zod） |
| **Controller** | URL 路由 → 呼叫 function | Vue Router |
| **Service** | 商業邏輯 + 資料庫操作 | Pinia actions |

## 五、其他沒選的流程原則（瞭解就好）

| 原則 | 全名 | 為什麼沒選 |
|---|---|---|
| BDD | Behavior-Driven Development | Given/When/Then 對團隊溝通有價值，但 solo 開發是額外負擔 |
| DDD | Domain-Driven Design | feature-based 組織已經體現 DDD 精神，不需要套用全套 DDD |
| SOLID | 5 個 OOP 原則 | SRP 已採用，其餘（OCP / LSP / ISP / DIP）NestJS 框架本身已處理 |

不是不好，是「**現階段對我的價值不如成本**」。團隊變大、系統變複雜時可能會回頭採用。

## 結語

開發原則不是教條，是**取捨工具**。YAGNI 提醒你不要做多餘的、KISS 提醒你不要為了炫技而炫技、SRP 提醒你模組職責要單一。SDD 適合資料導向系統、TDD 適合關鍵邏輯。後端四層架構讓「**從 HTTP 到 DB**」這條路清楚分工。

這套不會永遠對，但**有一套清楚的原則去測試新需求**，比起每次都從零判斷要快很多。
