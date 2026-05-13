---
title: NestJS 請求生命週期 — DI / Guard / Pipe / Interceptor 一次看懂
date: 2026-05-13
description: 一個 HTTP 請求進入 NestJS 後會經過 5 個關卡，每個角色職責清楚。這篇用「請求穿越走廊」的視角，把 DI、Guard、Pipe、Interceptor 串成一條線，順便補上 Swagger 自動產 API 文件的價值。
tags: [nestjs, backend, architecture, dependency-injection]
readMin: 10
draft: false
---

剛接觸 NestJS 時最迷惑的是它有一堆裝飾器：`@Injectable()`、`@UseGuards()`、`@UsePipes()`、`@UseInterceptors()`——每個都好像在做差不多的事，但又不完全一樣。

這篇用「請求穿越一條走廊」的視角，把這些角色串成一條清楚的順序，看完你會知道哪個裝飾器負責哪一段。

## 請求穿越的走廊

一個 HTTP 請求進到 NestJS 後，會依序經過這些關卡：

```
HTTP 請求進來
  │
  ▼
Guard ─────────── 沒權限？ ─→ 403 Forbidden（到此為止）
  │
  ▼（有權限）
Interceptor（前半）── 記錄開始時間 / 前處理
  │
  ▼
Pipe ───────────── 資料格式錯？ ─→ 400 Bad Request（到此為止）
  │
  ▼（資料正確）
Controller ──→ Service ──→ 處理業務邏輯
  │
  ▼
Interceptor（後半）── 包裝回應 / 記錄耗時 / 快取
  │
  ▼
HTTP 回應出去
```

每個關卡有獨立職責，失敗的話請求**立刻終止**，後續關卡跳過。看清楚這條走廊，後面所有事情就好懂了。

## 1. DI（Dependency Injection，依賴注入）

DI 不是請求生命週期的一環——它是**啟動時就準備好的基礎建設**。但所有後續關卡的物件都靠 DI 拿到。

### 為什麼需要 DI

當一個 class 需要用到另一個 class 時，沒有 DI 的世界長這樣：

```typescript
// ❌ 沒有 DI：每個 Service 自己 new，連線參數每次重複寫
class OrderService {
  constructor() {
    this.db = new Database('localhost', 5432, 'mydb', 'password123');
  }
}

class ProductService {
  constructor() {
    this.db = new Database('localhost', 5432, 'mydb', 'password123');
    //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                     同樣參數又寫一遍，密碼改了要改 N 個地方
  }
}
```

有了 DI：

```typescript
// ✅ 有 DI：Database 只在 Module 裡建立一次，所有 Service 共用
class OrderService {
  constructor(private db: Database) {}   // 拿到已建好的 instance
}

class ProductService {
  constructor(private db: Database) {}   // 拿到同一個 instance
}
```

### Database 從哪來

在 NestJS 的 **Module** 裡定義，整個 app 只寫一次：

```typescript
// database.module.ts — 怎麼建立、用什麼參數，只寫這一次
@Module({
  providers: [
    {
      provide: Database,
      useFactory: () => {
        return new Database('localhost', 5432, 'mydb', 'password123');
        //                  ↑ 密碼只寫在這一個地方
      },
    },
  ],
  exports: [Database],
})
export class DatabaseModule {}
```

```typescript
// order.module.ts — 聲明「我要用 DatabaseModule 提供的東西」
@Module({
  imports: [DatabaseModule],
  providers: [OrderService],
})
export class OrderModule {}
```

### 完整運作流程

```
App 啟動
  │
  ▼
NestJS 讀取所有 Module
  │
  ▼
DatabaseModule 說「Database 用 new Database(...) 建立」
  │
  ▼
NestJS 建立一個 Database instance，保存起來
  │
  ▼
發現 OrderService 的 constructor 需要 Database
  │
  ▼
把已建好的 instance 塞進去
  │
  ▼
OrderService 開始工作（從頭到尾不知道密碼是什麼）
```

這個共用的 instance 叫做 **Singleton**：整個應用只建一個，所有人拿到同一份。

### 換環境只改一處

```typescript
// 開發環境
useFactory: () => new Database('localhost', 5432, 'mydb', 'dev123')

// 正式環境（只改這裡，所有 Service 自動套用）
useFactory: () => new Database('production-server.com', 5432, 'mydb', 'super-secret')

// 測試環境（注入假的 Database，不用連真的資料庫）
useValue: fakeDatabaseForTesting
```

這是 DI 最大的工程價值：**配置一處改、全站生效**。

## 2. Guard — 守衛

決定請求「**能不能進來**」。回傳 `true` 放行，回傳 `false` 擋掉並回 403。

```typescript
@UseGuards(AuthGuard)        // 加這個裝飾器，這個 API 就需要登入才能用
@Get('/orders')
getOrders() { ... }

@UseGuards(RolesGuard)        // 角色守衛，只有管理員能刪商品
@Delete('/products/:id')
deleteProduct() { ... }
```

### 常見 Guard

| Guard | 檢查什麼 |
|---|---|
| `AuthGuard` | 有沒有登入（JWT Token 有效嗎） |
| `RolesGuard` | 角色對不對（admin / staff / manager） |
| `ThrottleGuard` | 請求是否太頻繁（防暴力攻擊） |

Guard 是**最先**執行的——擋掉一個請求的最低成本就在這裡。

## 3. Pipe — 管道

檢查傳進來的資料「**格式對不對**」。格式錯直接回 400，根本不會進到 Controller。

```typescript
class CreateProductDto {
  @IsString()
  name: string;            // 必須是字串

  @IsNumber()
  @Min(0)
  price: number;           // 必須是 ≥ 0 的數字
}

@Post('/products')
create(@Body() dto: CreateProductDto) {
  // 走到這裡時，dto 保證格式正確
  // 前端傳了 price: "abc"，NestJS 自動回 400，不會進到這裡
}
```

### 常見 Pipe

| Pipe | 做什麼 |
|---|---|
| `ValidationPipe` | 驗證 DTO 所有欄位是否合法 |
| `ParseIntPipe` | 字串 `"123"` → 數字 `123` |
| `ParseUUIDPipe` | 確認是合法的 UUID 格式 |

Pipe 替你把「資料格式驗證」這件雜事從 Controller 抽出來——Controller 只專心做業務邏輯。

## 4. Interceptor — 攔截器

NestJS 裡**唯一能同時碰到請求和回應**的角色。在請求進來時做一件事，回應出去時再做一件事。

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context, next) {
    const start = Date.now();              // ← 請求進來：記錄開始時間
    console.log('請求進來了');

    return next.handle().pipe(
      tap(() => {                          // ← 回應出去：記錄花了多久
        console.log(`處理完成，花了 ${Date.now() - start}ms`);
      }),
    );
  }
}
```

### 常見 Interceptor

| Interceptor | 做什麼 |
|---|---|
| `LoggingInterceptor` | 記錄每個 API 的處理時間 |
| `TransformInterceptor` | 統一把回應包成 `{ data: ... }` 格式 |
| `CacheInterceptor` | 快取回應，相同請求不重複查資料庫 |
| `AuditInterceptor` | 記錄誰改了什麼（審計日誌） |

Interceptor 的特殊之處是**橫跨「進」與「出」**——這正是它能做「測量耗時」「包裝回應」這類事情的原因。

## 5. Swagger — 自動 API 文件

從程式碼中的裝飾器自動產生互動式 API 文件網頁，**完全不需要另外維護一份文件**。

```typescript
@ApiTags('Products')
@Controller('products')
export class ProductsController {

  @ApiOperation({ summary: '取得所有商品' })
  @ApiResponse({ status: 200, description: '成功回傳商品列表' })
  @Get()
  findAll() { ... }
}
```

打開 `http://localhost:3000/api-docs` 就會看到：

```
┌─────────────────────────────────────────┐
│  Products API                           │
├─────────────────────────────────────────┤
│  GET    /products        取得所有商品    │  [Try it out]
│  GET    /products/:id    取得單一商品    │  [Try it out]
│  POST   /products        建立新商品     │  [Try it out]
│  PATCH  /products/:id    更新商品       │  [Try it out]
│  DELETE /products/:id    刪除商品       │  [Try it out]
└─────────────────────────────────────────┘
```

前端工程師不用看後端程式碼，直接開這個頁面就能測 API。**程式碼即文件**——這對團隊溝通效率的提升非常實際。

## 各角色職責對照表

| 角色 | 時機 | 職責 | 失敗結果 |
|---|---|---|---|
| **Guard** | 最先 | 檢查權限（能不能進來） | 403 Forbidden |
| **Interceptor 前半** | 第二 | 前處理（記錄、轉換） | — |
| **Pipe** | 第三 | 驗證資料格式 | 400 Bad Request |
| **Controller** | 第四 | 接收請求，分派工作 | — |
| **Service** | 第五 | 處理業務邏輯 | 500 或自訂錯誤 |
| **Interceptor 後半** | 最後 | 後處理（包裝回應、記錄耗時） | — |
| **DI** | 啟動時 | 建立並分配所有 instance | — |
| **Swagger** | 開發時 | 自動產生 API 文件 | — |

## 結語

NestJS 看似裝飾器一堆，但所有的角色其實只是把「**一個請求要經歷的事情**」拆成不同職責的層。理解了「走廊」這個比喻後，下次看到 `@UseGuards`、`@UsePipes` 就知道它們塞在這條走廊的哪一段，不會再混淆。

DI 是底層基礎，剩下四個（Guard / Pipe / Interceptor / Controller）是走廊本身，Swagger 是替走廊掛地圖——這就是 NestJS 的全景。
