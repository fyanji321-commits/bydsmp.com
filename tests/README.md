# 測試說明

## 執行方式

請先在專案根目錄安裝依賴並執行測試：

```bash
npm install
npm test
```

## 指令

| 指令 | 說明 |
|------|------|
| `npm test` | 執行所有測試（單次） |
| `npm run test:watch` | 監聽模式，檔案變更時自動重跑 |
| `npm run test:coverage` | 執行測試並產出覆蓋率報告（`coverage/`） |

## 目錄結構

- **tests/unit/** — 單元測試（CONFIG 契約、main.js 掛載）
- **tests/integration/** — 整合測試（rulesTabs 等，需 jsdom）
- **tests/fixtures/** — 測試用 HTML 片段

## 覆蓋率說明

`npm run test:coverage` 會產出報告，但 **assets/js 的覆蓋率數字可能為 0%**。原因是測試以 `readFileSync` + `new Function(程式碼)()` 執行原始腳本，執行時未經 Vitest 插樁，故不會計入覆蓋。功能仍由 83 個測試驗證；若需要覆蓋率數字，可考慮改為以 `import`/`require` 載入原始檔（需在原始檔加上條件式 export）。

## 預期的 stderr

- **「Not implemented: navigation」**：jsdom 不實作頁面導航，點擊含 `href` 的連結時會出現，測試仍通過。
- **「無法複製文字」**：測 clipboard 失敗情境時，copyIP 會呼叫 `console.error`，測試中已 mock 以減少輸出。

## 詳情

測試策略與改進建議見 [docs/TEST_COVERAGE_ANALYSIS.md](../docs/TEST_COVERAGE_ANALYSIS.md)。
