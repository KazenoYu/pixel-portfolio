---
title: Redis Pub/Sub vs WebSocket — 不是替代關係，是配合關係
date: 2026-05-13
description: 即時通訊兩個技術常被混淆，但它們解決的是不同層的問題：WebSocket 是「後端到前端」，Redis Pub/Sub 是「後端到後端」。小規模一個就夠，多台伺服器才需要兩個一起。
tags: [redis, websocket, realtime, backend]
readMin: 5
draft: false
---

技術選型討論中，「要做即時通訊」這個需求一出來，立刻就會出現兩個名字：**WebSocket** 和 **Redis Pub/Sub**。新手常以為它們是「擇一」，但實際上**它們解決的根本不是同一個問題**——很多系統兩個都要用。

## Pub/Sub 是什麼

Pub/Sub = **Publish / Subscribe（發布 / 訂閱）**，一種訊息傳遞模式。

```
發布者（Publish）                       訂閱者（Subscribe）
                    ┌─────────┐
收銀台 A ──發送──→  │  Redis   │ ──推送──→ 廚房顯示器
  "新訂單 #456"     │ 頻道：   │ ──推送──→ 營業額看板
                    │ "orders" │ ──推送──→ 庫存系統
                    └─────────┘
```

三個角色：

- **頻道（Channel）**：命名的訊息通道，例如 `"orders"`、`"inventory-alerts"`
- **發布者（Publisher）**：往頻道丟訊息的人
- **訂閱者（Subscriber）**：監聽頻道的人，有新訊息會主動收到

## 範例程式碼

```typescript
// 訂閱者：廚房顯示器啟動時，監聽 "orders" 頻道
redis.subscribe('orders', (message) => {
  console.log('收到新訂單：', message);
});

// 發布者：收銀台結帳完成時，發送訊息
redis.publish('orders', JSON.stringify({
  id: 456,
  items: ['拿鐵 x1', '美式 x2'],
}));

// 所有訂閱了 "orders" 的人都會收到
```

幾行 code 就能達到「廣播」的效果，**所有訂閱者非同步收到**，不用一個個 push。

## Redis Pub/Sub vs WebSocket（Socket.io）

|  | Redis Pub/Sub | WebSocket (Socket.io) |
|---|---|---|
| **溝通對象** | 後端服務之間 | 後端 ↔ 前端瀏覽器 |
| **使用場景** | 伺服器 A 通知伺服器 B | 伺服器推送資料到網頁 |
| **持久連線** | 否，訊息即發即收 | 是，連線常駐 |
| **使用協定** | TCP（Redis 自家協定） | TCP + WebSocket upgrade |

**它們處理的是不同層**：
- WebSocket 是給 **瀏覽器 ↔ 伺服器** 的長連線
- Redis Pub/Sub 是給 **伺服器 ↔ 伺服器** 的訊息匯流排

## 什麼時候需要 Redis Pub/Sub

### 一台伺服器：不需要

Socket.io 自己就夠了。一台伺服器知道所有連線，新訂單來就直接推給對應的前端。

```
收銀台瀏覽器          伺服器 A           廚房瀏覽器
    │                  │                  │
    │── WebSocket ──→  │                  │
    │   送出訂單       │                  │
    │                  │── WebSocket ──→  │
    │                  │   推送到廚房      │
```

### 多台伺服器：需要

伺服器 A 收到的訂單，**伺服器 B 完全不知道**——它們各自只認識自己的連線。這時候需要 Redis Pub/Sub 在伺服器之間傳遞。

```
收銀台瀏覽器          伺服器 A           Redis          伺服器 B          廚房瀏覽器
    │                  │                 │                │                 │
    │── WebSocket ──→  │                 │                │                 │
    │   送出訂單       │── Publish ──→   │ ──→ Sub ──→   │                 │
    │                  │                 │                │── WebSocket ──→ │
    │                  │                 │                │   推送到廚房     │
```

訂單的訊息流：

1. 收銀台瀏覽器透過 **WebSocket** 把訂單送到伺服器 A
2. 伺服器 A 透過 **Redis Pub/Sub publish** 廣播給所有伺服器
3. 伺服器 B（廚房連的那台）**subscribe** 到訊息
4. 伺服器 B 透過 **WebSocket** 把訂單推給廚房畫面

**兩個技術各做各的事，缺一不可**。

## 重點

- **WebSocket** 解決「後端到前端的即時推送」
- **Redis Pub/Sub** 解決「後端服務之間的訊息傳遞」
- 小規模先用 Socket.io，**擴充到多台伺服器再加 Redis Pub/Sub**
- 它們不是替代品，**多伺服器系統幾乎都會兩個一起用**

下次有人問「為什麼要兩個都用」，先問他：「你系統有幾台 server？」——這題的答案決定 Redis 該不該登場。
