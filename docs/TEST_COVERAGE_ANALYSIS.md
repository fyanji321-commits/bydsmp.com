# BYDSMP 網站測試覆蓋率分析與改進建議

## 一、目前測試覆蓋狀況

### 1.1 現狀摘要（已更新）

| 項目 | 狀態 |
|------|------|
| 自動化測試 | **已有** — `tests/unit/` 與 `tests/integration/` 內含多個 `.test.js` |
| 測試框架 | **Vitest** + **jsdom**，`package.json` 含 `test`、`test:watch`、`test:coverage` |
| 測試類型 | 單元測試（config、main、copyIP、navigation、galleryCarousel、modesScroll）+ 整合測試（同上模組 + rulesTabs） |
| 覆蓋率 | 可執行 `npm run test:coverage`，覆蓋範圍為 `assets/js/**/*.js`（排除 backgroundSlider、particleBackground、typewriter） |

專案為純靜態網站（HTML + CSS + Vanilla JS），目前已具備單元／整合測試與覆蓋率報告基礎建設。

### 1.2 具備可測試邏輯的模組

以下模組含有**業務／互動邏輯**，適合納入自動化測試：

| 模組 | 路徑 | 主要邏輯 | 與 DOM / 全域依賴 |
|------|------|----------|-------------------|
| **config** | `assets/js/config.js` | 設定結構、預設值 | 無（純資料） |
| **copyIP** | `assets/js/modules/copyIP.js` | 複製 IP、Toast 顯示、fallback、防重複點擊 | 強（DOM、`CONFIG`、`navigator.clipboard`） |
| **navigation** | `assets/js/modules/navigation.js` | 首頁隱藏導覽、子頁常顯、漢堡選單、點外關閉 | 強（DOM、`window.location`、`scrollY`） |
| **galleryCarousel** | `assets/js/modules/galleryCarousel.js` | 索引計算、循環、方向、觸控閾值、自動播放 | 中（DOM、`CONFIG`、閉包狀態） |
| **modesScroll** | `assets/js/modules/modesScroll.js` | IntersectionObserver、`is-in-view` / `modes-animated` | 強（DOM） |
| **rulesTabs** | `assets/js/modules/rulesTabs.js` | 捲動置頂、hash 與 tab 對應、`switchTab`、`replaceState` | 強（DOM、`history`、`location.hash`） |
| **main** | `assets/js/main.js` | 將 `CONFIG` 掛到 `window` | 弱（僅 `CONFIG`） |

---

## 二、建議改進方向（按優先級）— 以下為通用指引，2.1、2.4 已實作

### 2.1 高優先級：建立最小測試基礎建設 ✅ 已完成

**目標**：在不破壞「無 build、開 HTML 即用」的前提下，引入**僅供開發/CI 使用**的測試。

**建議**：

1. **新增 `package.json`（僅 dev 依賴）**  
   - 僅用於跑測試與（可選）覆蓋率，不參與網站上線產物。
2. **選擇輕量測試框架**  
   - **Vitest**：與 Vite 整合佳、ESM 友善、執行快，適合現代 JS。  
   - 或 **Jest** + **jsdom**：生態成熟，若團隊已熟悉可沿用。
3. **覆蓋率工具**  
   - Vitest 內建 `--coverage`（v8 或 istanbul）；Jest 內建 `--coverage`。  
   - 產出可寫入 `coverage/` 並加入 `.gitignore`，必要時在 CI 上傳報告。

這樣可以開始寫單元／整合測試，並得到覆蓋率數字。

---

### 2.2 高優先級：可抽離的純邏輯單元測試

下列邏輯**可抽出成純函式**並單獨測，不依賴真實 DOM，易維護、回歸快。

| 模組 | 建議抽離的邏輯 | 測試重點 |
|------|----------------|----------|
| **navigation** | `isSubPage(pathname)` | `rules.html`、`rules`、`sponsor.html`、`/sponsor`、根路徑等是否正確判為子頁 |
| **galleryCarousel** | 索引正規化（循環） | `index ± 1` 在 0、1、n-1、n 等邊界是否正確變成 0 或 n-1 |
| **galleryCarousel** | 滑動方向判定 | 給定 `touchStartX`、`touchEndX`、閾值，是否正確回傳 next/prev/none |
| **rulesTabs** | hash 與 tab 對應 | 給定一組 `data-tab` 與 `id`，從 `location.hash` 解析出要啟用的 tab 是否正確 |

**實作要點**：  
- 在模組內用 IIFE 導出「純函式」到 `window` 的某個命名空間（例如 `window.__BYDSMP_TEST__`），僅在測試環境或透過測試專用入口載入；  
- 或將上述邏輯抽到獨立小模組（如 `utils/navigationPath.js`、`utils/carouselIndex.js`），由原模組與測試共同引用。  
這樣**不需改動現有頁面載入方式**即可為邏輯寫單元測試。

---

### 2.3 中優先級：DOM 依賴模組的整合測試（jsdom）

在 **jsdom** 環境下建立最小 DOM 結構，載入模組並觸發事件，驗證 class、屬性、`replaceState` 等。

建議優先覆蓋：

| 模組 | 測試情境 |
|------|----------|
| **rulesTabs** | 1) 初始無 hash → 第一個 panel 為 active；2) 初始 `#tab-pvp` → 對應 tab/panel 為 active；3) 點擊某 tab → 該 panel active、URL hash 更新、`aria-selected`/`aria-hidden` 正確。 |
| **navigation** | 1) `pathname` 為子頁 → `nav` 不加上 `nav-hidden`；2) 首頁且 `scrollY &lt; 50` → `nav-hidden`；3) 首頁 `scrollY &gt; 50` → 移除 `nav-hidden`（需 mock `window.scrollY` 或觸發 scroll）。 |
| **copyIP** | 1) 有 `.ip-box` 與 `#copy-toast` 時，點擊後 toast 出現且文字為「已複製IP位置」；2) 無 `.ip-box` 時不報錯、不綁定。需 mock `navigator.clipboard.writeText` 與 `CONFIG`。 |
| **galleryCarousel** | 1) 初始化後第一張為 active、indicator 對應；2) 點 next → currentIndex 循環；3) 點 indicator → 切到該張；4) `CONFIG.galleryAutoPlay === false` 時不啟動 interval。 |

可依實際是否容易在 jsdom 中模擬觸控/鍵盤，決定 carousel 的觸控與鍵盤測試放在這裡或 E2E。

---

### 2.4 中優先級：CONFIG 與 main 的契約測試 ✅ 已完成

- **config.js**  
  - 測試：`CONFIG` 存在且包含 `serverIP`、`discordLink`、`galleryInterval`、`copyResetDelay` 等必要鍵，且型別正確（字串、數字、布林）。  
  - 可避免重構或修改時誤刪或改錯鍵名。
- **main.js**  
  - 測試：在載入 `config.js` 後再載入 `main.js`，`window.CONFIG === CONFIG`。  
  - 確保入口行為不因日後改動而失效。

---

### 2.5 低優先級：E2E 關鍵流程（可選）

若希望自動化「真實瀏覽器」行為，可考慮 **Playwright** 或 **Cypress**，針對下列流程各寫 1～2 個 E2E：

- **首頁**：捲動後導覽列出現、點擊複製 IP 後出現「已複製IP位置」、輪播下一張／上一張、漢堡選單開關。
- **規則頁**：載入 `#tab-pvp` 時直接顯示 PVP 規則、切換 tab 後 URL 與內容一致。
- **贊助頁**：導覽列常顯、表格與 CTA 可見。

不需追求高覆蓋率，以**關鍵路徑不壞**為目標即可。

---

### 2.6 低優先級：HTML / 無障礙與 SEO 靜態檢查

- **HTML 驗證**：例如用 **html-validate** 或 **W3C Nu Validator** 對 `index.html`、`rules.html`、`sponsor.html` 做靜態檢查。  
- **無障礙**：**axe-core** 或 **pa11y** 在 CI 或本地對建好的頁面跑一次，確保 ARIA、鍵盤操作等符合基本標準。  
- **SEO**：檢查每頁必備 meta（description、canonical、og、twitter）、以及 JSON-LD 是否存在且可解析。

可做成 npm script（如 `test:html`、`test:a11y`），與單元測試一起在 CI 執行。

---

## 三、建議的測試目錄結構

在維持現有網站根目錄不變的前提下，可採用：

```
bydsmp.com/
├── assets/           # 現有靜態資源，不變
├── docs/             # 本分析等文件
├── tests/            # 新增
│   ├── unit/         # 純邏輯、CONFIG、main
│   │   ├── config.test.js
│   │   ├── main.test.js
│   │   ├── navigationPath.test.js
│   │   └── carouselIndex.test.js
│   ├── integration/  # jsdom 整合
│   │   ├── copyIP.test.js
│   │   ├── navigation.test.js
│   │   ├── galleryCarousel.test.js
│   │   └── rulesTabs.test.js
│   └── fixtures/     # 最小 HTML 片段或 mock DOM
│       └── ...
├── package.json      # 僅 devDependencies
├── vitest.config.js  # 或 jest.config.js
└── ...
```

---

## 四、小結：建議執行順序

1. **立即可做（無需改程式邏輯）**  
   - 新增 `package.json` + Vitest（或 Jest）+ jsdom。  
   - 為 `CONFIG` 寫契約測試、為 `main.js` 寫掛載測試。

2. **短期**  
   - 抽離並測試 **navigation 的 isSubPage**、**galleryCarousel 的索引與滑動方向**、**rulesTabs 的 hash 對應**。  
   - 在 jsdom 下為 **rulesTabs**、**copyIP**、**navigation**、**galleryCarousel** 寫整合測試。

3. **中期**  
   - 在 CI 加入 `npm test` 與覆蓋率門檻（例如 60% 以上再提高）。  
   - 視需求加入 1～2 個 E2E 關鍵流程。

4. **可選**  
   - HTML / 無障礙 / SEO 靜態檢查腳本。

---

## 五、當前覆蓋率缺口與具體改進建議

以下依程式碼與現有測試比對結果整理。基礎建設與 CONFIG/main 契約測試**已完成**，可從下方缺口著手提升覆蓋率與信心。

### 5.1 copyIP.js

| 缺口 | 說明 | 建議 |
|------|------|------|
| **`window.copyIP()` 全域函式** | 程式碼將 `window.copyIP` 設為 async 函式，目前測試僅覆蓋「點擊 `.ip-box`」路徑，未呼叫 `window.copyIP()` | 在 unit 或 integration 中新增：呼叫 `window.copyIP()` 後應觸發 `clipboard.writeText` 與 toast 顯示；無 `.ip-box` 時呼叫不報錯、不寫入 clipboard |
| **Fallback 內層 catch** | `document.execCommand('copy')` 成功後有 `setTimeout`，但若 `execCommand` 或後續拋錯會進入內層 `catch`，僅將 `isCopying = false` | 新增一則測試：mock `execCommand` 在呼叫後拋錯，驗證 `isCopying` 被重置且可再次點擊 |
| **無 .ip-box 時 init 提早 return** | `initCopyIP` 內 `if (!ipBox) return` 未在測試中明確覆蓋 | 可選：一則測試無 `.ip-box` 的 DOM 下執行模組，確認不報錯且未綁定 click |

### 5.2 navigation.js

| 缺口 | 說明 | 建議 |
|------|------|------|
| **pathname 無 .html 的子頁判定** | 原始碼支援 `pathname.endsWith('/rules')`、`pathname.endsWith('/sponsor')`，目前 unit/integration 多測 `/rules.html`、`/sponsor.html` | 新增：`pathname` 為 `/rules` 或 `/sponsor` 時，nav **不**應加上 `nav-hidden` |
| **DOMContentLoaded 延遲 init** | `document.readyState === 'loading'` 時會等 `DOMContentLoaded` 再 init；jsdom 下多為 `complete`，此分支可能未覆蓋 | 可選：在 readyState 為 `loading` 的環境下觸發 `DOMContentLoaded`，驗證 init 仍被執行（或接受此分支僅在真實瀏覽器執行） |

### 5.3 galleryCarousel.js

| 缺口 | 說明 | 建議 |
|------|------|------|
| **點擊 indicator 切換** | `indicator.addEventListener('click', () => goToSlide(index))` 行為未在測試中驗證 | 新增：點擊第二／第三個 `.gallery-indicator` 後，對應 slide 為 active、指示器 aria-selected 正確 |
| **galleryPauseOnHover** | `CONFIG.galleryPauseOnHover` 為 true 時，`mouseenter` 暫停、`mouseleave` 恢復自動播放 | 新增：啟用自動播放 + `galleryPauseOnHover: true`，對 carousel 觸發 `mouseenter` 後 advance 時間，應未切換；觸發 `mouseleave` 後再 advance interval 時間，應切到下一張 |
| **CONFIG.galleryTransitionDuration 回退** | 程式碼使用 `CONFIG.galleryTransitionDuration \|\| 500`，目前測試多設 100 | 可選：一則測試未提供該鍵或為 0 時，setTimeout 仍使用合理值（500），避免邊界錯誤 |

### 5.4 rulesTabs.js

| 缺口 | 說明 | 建議 |
|------|------|------|
| **僅有整合測試** | 無單元測試；hash 與 tab 對應邏輯與「無效 hash → 第一個 panel」均在 init 內一併執行 | 可選：抽離「由 hash + tab 按鈕 data-tab 決定 targetId」為純函式並單元測試；或維持僅整合測試，補足下列情境 |
| **捲動置頂與 history** | `scrollRestoration = 'manual'`、`scrollToTop()`、`pageshow` / `load` 多次呼叫 `scrollToTop` 均未測 | 新增：執行模組後 `history.scrollRestoration` 應為 `'manual'`（若支援）；`window.scrollTo` 應被呼叫（可 mock）；可選：觸發 `pageshow` / `load` 驗證 `scrollTo` 再次被呼叫 |
| **無效 hash 時預設第一 tab** | 整合測試已有「無 hash → 第一個 tab active」；若 hash 有值但不在 `data-tab` 清單中，程式會走 `switchTab(panels[0].id)` | 新增：`location.hash = '#invalid-tab'` 時，應啟用第一個 tab/panel 且 URL 被 replaceState 為 `#tab-xxx`（第一個 panel 的 id） |

### 5.5 modesScroll.js

| 缺口 | 說明 | 建議 |
|------|------|------|
| **無 #modes 時提早 return** | `if (!section) return` 未在測試中覆蓋 | 可選：一則測試 DOM 中無 `#modes` 時執行模組，確認不報錯、不建立 observer（或 observer.observe 未被呼叫） |

### 5.6 未納入覆蓋的模組

| 模組 | 說明 | 建議 |
|------|------|------|
| **backgroundSlider.js** | 已於 vitest 的 coverage.exclude 排除 | 若該模組有重要邏輯（例如索引、定時器），可考慮納入覆蓋並寫少量整合測試；否則維持排除 |
| **particleBackground.js** | 同上 | 同上 |
| **typewriter.js** | 同上 | 同上 |

### 5.7 測試結構與 CI

| 項目 | 建議 |
|------|------|
| **覆蓋率門檻** | 在 CI 中設定 `vitest run --coverage` 且要求某門檻（例如 statements/branches ≥ 60%），再逐步提高 |
| **重複測試檔** | 確認 `tests/unit/copyIP.test.js` 僅有一份（Windows 路徑 `tests\unit\copyIP.test.js` 為同一檔案），避免重複執行或遺漏 |
| **E2E** | 若需驗證真實瀏覽器行為（複製權限、觸控、多頁導航），可後續加入 Playwright/Cypress 關鍵流程 |

---

## 六、小結：建議執行順序（更新）

1. **已完成**  
   - `package.json` + Vitest + jsdom、CONFIG 契約測試、main 掛載測試；copyIP、navigation、galleryCarousel、modesScroll、rulesTabs 的單元／整合測試已存在。

2. **短期建議（補缺口）**  
   - **copyIP**：補 `window.copyIP()` 與 fallback 內層 catch 測試。  
   - **navigation**：補 pathname `/rules`、`/sponsor`（無 .html）之 isSubPage 行為。  
   - **galleryCarousel**：補 indicator 點擊、`galleryPauseOnHover`（mouseenter/mouseleave）。  
   - **rulesTabs**：補 scrollRestoration/scrollToTop、無效 hash 預設第一 tab。

3. **中期**  
   - CI 加入 `npm run test:coverage` 與覆蓋率門檻；視需要加入 1～2 個 E2E 關鍵流程。

4. **可選**  
   - HTML／無障礙／SEO 靜態檢查；modesScroll 無 `#modes`、copyIP 無 `.ip-box` 等邊界測試。

以下第二～四節保留為**通用改進方向與目錄結構參考**（部分項目已完成）。
