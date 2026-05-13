---
title: 用 CASL 把權限規則從 if/else 地獄裡救出來
date: 2026-05-13
description: 權限規則散落在前後端、各種 if/else 裡是常見災難。CASL 把規則集中到一個 function，前後端共用，還支援「只能看自己資料」這種細粒度條件。
tags: [authorization, security, casl, nestjs]
readMin: 5
draft: false
---

權限控制聽起來簡單——「管理員可以刪、店員不行」——直到你發現相同的判斷已經散落在 10 個 controller、20 個 React 元件、3 個 middleware 裡。改個權限規則要 review 30 處，漏掉一處就是 bug 或安全漏洞。

CASL 解這個問題的方式很單純：**規則集中定義一處，前後端共用同一份**。

## CASL 是什麼

`@casl/ability` 是個 npm 套件，用程式碼集中定義「**誰可以對什麼做什麼**」。一份規則，前後端共用——前端用來決定畫面顯示什麼按鈕，後端用來決定能不能執行操作。

## 集中定義規則

```typescript
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === 'admin') {
    can('manage', 'all');                            // admin 全權
  }

  if (user.role === 'manager') {
    can('read', 'Product');
    can('create', 'Product');
    can('update', 'Product');
    can('delete', 'Product');
    can('read', 'Order');
    can('manage', 'Inventory');
    cannot('delete', 'Order');                       // 但不能刪訂單
  }

  if (user.role === 'cashier') {
    can('read', 'Product');
    can('create', 'Order');
    can('read', 'Order', { cashierId: user.id });    // 只能看自己的訂單
    cannot('update', 'Product');
  }

  return build();
}
```

整個 app 的權限矩陣**只寫在這個 function 裡**。改權限只要改這裡，其他地方都不動。

## 後端：NestJS Guard 使用

```typescript
const ability = defineAbilitiesFor(currentUser);

ability.can('create', 'Order');     // cashier → true
ability.can('delete', 'Product');   // cashier → false

// Controller 用 Guard 擋
@UseGuards(AbilitiesGuard)
@CheckAbilities({ action: 'delete', subject: 'Product' })
@Delete('/products/:id')
deleteProduct() { ... }
// cashier 來 → 自動 403 Forbidden
// manager 來 → 放行
```

權限檢查變成宣告式——**Controller 自己不用判斷**，Guard 看裝飾器就知道規則。

## 前端：React 元件使用

```typescript
function ProductActions({ product }) {
  const ability = useAbility();

  return (
    <div>
      {ability.can('update', 'Product') && <button>編輯</button>}
      {ability.can('delete', 'Product') && <button>刪除</button>}
      {/* cashier 看不到這兩個按鈕，manager 看得到 */}
    </div>
  );
}
```

前端 `ability` 的來源跟後端是**同一個 function**——這樣就不會出現「前端顯示按鈕但後端說沒權限」的窘況。

## 為什麼不自己寫 if/else

```typescript
// ❌ 散落各處，改權限要改 N 個地方，還可能漏掉
if (user.role === 'admin' || user.role === 'manager') { ... }
// ...另一個檔案...
if (['admin', 'manager'].includes(user.role)) { ... }
// ...又一個檔案...
const canEdit = user.role === 'admin' || user.role === 'manager';

// ✅ CASL：規則一處，檢查一行
ability.can('delete', 'Product');
// 改權限 → 只改 defineAbilitiesFor
```

「**散落 vs 集中**」是這個套件的核心價值。寫起來只是換個語法，但維護成本完全不同。

## 細粒度條件：基於資料的權限

CASL 不只能說「能不能做」，還能說「能對哪些資料做」。

```typescript
can('read', 'Order', { cashierId: user.id });
```

這條規則的意思：**店員只能看 `cashierId === 自己 id` 的訂單**。檢查時 CASL 會把這個條件套上去：

```typescript
ability.can('read', someOrder);
// → 如果 someOrder.cashierId === user.id 才回 true
```

對於 ERP 這種「**每個人只看自己負責的資料**」的場景，這個能力比純粹的角色控制重要得多。

## 重點

- **規則集中**：所有權限定義在一個 function，改一處全站生效
- **前後端共用**：同一份規則，前端決定 UI、後端決定 API
- **細粒度條件**：不只「能不能」，還能「能對哪些」
- **NestJS 友善**：搭配 Guard + 裝飾器，Controller 不用自己寫權限邏輯

下次新需求需要「某個角色只能看某種狀態的訂單」這種規則，可以直接加在 `defineAbilitiesFor` 裡一行解決，不用滿世界找哪裡要改。
