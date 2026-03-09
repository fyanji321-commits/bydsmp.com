---
name: add-sponsor
description: 添加贊助紀錄至 BYDSMP 網站贊助名單。當需要新增贊助者、更新贊助金額或維護贊助排行榜時使用。
---

# 添加贊助名單

## 資料來源

所有贊助紀錄儲存於：

```
docs/sponsors.json
```

`sponsorLeaderboard.js` 在頁面載入時讀取此檔案，自動計算並渲染「近期贊助」、「最高單筆贊助」、「最高贊助總額」三個統計卡片。

---

## JSON 格式

```json
{
  "sponsors": [
    {
      "id":     "玩家的 Minecraft ID（英文大小寫須正確）",
      "name":   "顯示名稱（通常與 id 相同）",
      "amount": 1000,
      "date":   "YYYY-MM-DD"
    }
  ]
}
```

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | Minecraft 玩家 ID；用於 Minotar 頭像 URL（大小寫敏感） |
| `name` | string | 頁面上顯示的名稱 |
| `amount` | number | **本次**贊助金額（TWD），不含單位文字 |
| `date` | string | 贊助日期，格式 `YYYY-MM-DD` |

> 若同一玩家多次贊助，請分別新增多筆紀錄（相同 `id`）。「最高贊助總額」統計會自動累計。

---

## 添加步驟

1. 開啟 `docs/sponsors.json`
2. 在 `"sponsors"` 陣列末尾新增一筆物件（注意前一筆末尾加上逗號）：

```json
{ "id": "NewPlayer", "name": "NewPlayer", "amount": 400, "date": "2026-03-01" }
```

3. 儲存檔案，統計卡片將於下次頁面載入時自動更新。

---

## 統計卡片說明

### 近期贊助
依 `date` 欄位降序排列，取最新的 **前 3 筆**。

### 最高單筆贊助
比較所有紀錄的 `amount`，顯示**單次金額最高**的玩家。

### 最高贊助總額
將相同 `id` 的所有 `amount` 加總，顯示**累計金額最高**的玩家。

---

## 完整範例

目前 `docs/sponsors.json` 內容：

```json
{
  "sponsors": [
    { "id": "joker114514", "name": "joker114514", "amount": 600,  "date": "2026-02-12" },
    { "id": "124kkk",      "name": "124kkk",       "amount": 1600, "date": "2026-02-12" },
    { "id": "Texdizzy_tw", "name": "Texdizzy_tw",  "amount": 2000, "date": "2026-02-19" },
    { "id": "cxy_1",       "name": "cxy_1",         "amount": 200,  "date": "2026-02-26" }
  ]
}
```

新增一筆後範例：

```json
{
  "sponsors": [
    { "id": "joker114514", "name": "joker114514", "amount": 600,  "date": "2026-02-12" },
    { "id": "124kkk",      "name": "124kkk",       "amount": 1600, "date": "2026-02-12" },
    { "id": "Texdizzy_tw", "name": "Texdizzy_tw",  "amount": 2000, "date": "2026-02-19" },
    { "id": "cxy_1",       "name": "cxy_1",         "amount": 200,  "date": "2026-02-26" },
    { "id": "NewPlayer",   "name": "NewPlayer",     "amount": 400,  "date": "2026-03-01" }
  ]
}
```

---

## 注意事項

- **`id` 大小寫**必須與玩家 Minecraft 帳號完全一致，否則頭像可能無法正常顯示（Minotar 大小寫敏感）。
- 若頭像載入失敗，會自動顯示預設的 Steve 頭像。
- `date` 格式固定為 `YYYY-MM-DD`，否則排序結果不正確。
- `amount` 為純數字，不需包含 "TWD" 或 "$" 等符號。
