# BYDSMP 官方網站

BYDSMP 是一個台灣 Minecraft 伺服器的官方網站，提供伺服器資訊、遊戲分流介紹、規則說明和贊助支持等功能。

## 📋 專案簡介

這是一個單頁面（Single Page Application）網站，採用模組化的 HTML、CSS 和 JavaScript 架構開發。網站採用現代化的霓虹燈風格設計，包含豐富的動畫效果和互動功能，提供流暢的使用者體驗，並針對 SEO、性能和可訪問性進行了優化。

## 🎮 伺服器資訊

- **伺服器名稱**: BYDSMP
- **伺服器 IP**: bydsmp.com
- **Discord**: [加入 Discord](https://discord.gg/2EDqgeRKPs)
- **聯絡信箱**: bydsmp@gmail.com

## 🎯 主要功能

### 1. Hero 區塊（首頁）
- **動態標題**: BYDSMP 標題具有多重循環動畫效果（漸變、浮動、縮放）
- **打字機效果副標**: 5 個標語自動循環顯示，帶有打字機動畫和閃爍游標
- **現代化 IP 按鈕**: 
  - 膠囊形設計，玻璃態效果
  - 邊框流水線動畫
  - 懸停時顯示「點擊複製連線位置」
  - 點擊後顯示「已複製」，3 秒後自動恢復
- **漂浮點粒子背景**: Canvas 繪製的動態粒子系統，粒子間自動連線

### 2. 遊戲分流介紹
- **SMP 生存分流**: 防噴生存、全新地形、領地系統、友好社交環境
- **KitPVP 競技分流**: 戰力系統、沙箱場地、嚴格防掛、多種 PVP 模式

### 3. 伺服器相冊（輪播模式）
- **自動輪播**: 每 5 秒自動切換圖片
- **手動控制**: 上一張/下一張按鈕
- **指示器**: 顯示當前圖片位置
- **切換動畫**: 流暢的滑入/滑出動畫效果
- **響應式設計**: 適配不同螢幕尺寸
- **觸摸支持**: 移動設備支援滑動切換
- **鍵盤導航**: 支援左右箭頭鍵切換
- **懸停暫停**: 滑鼠懸停時暫停自動播放

### 4. 伺服器規則
詳細說明伺服器規則，包括：
- 基本規則
- 世界規則
- 生電規則
- PVP 規則
- 違規處理（紅色標題強調）

### 5. 贊助支持
提供純贊助支持功能，包含完整的免責聲明。

## 🛠️ 技術架構

### 前端技術
- **HTML5**: 語義化標籤結構，完整的 SEO meta 標籤
- **CSS3**: 
  - 模組化 CSS 架構
  - CSS 變數（Custom Properties）
  - Flexbox 和 Grid 佈局
  - 響應式設計（RWD）
  - 豐富的動畫和過渡效果
  - 玻璃態效果（backdrop-filter）
- **JavaScript (Vanilla)**: 
  - 模組化 JavaScript 架構
  - DOM 操作
  - 事件處理
  - 剪貼簿 API
  - Canvas API（粒子背景）
  - 打字機效果實現
  - 輪播功能實現

### 外部資源
- **Google Fonts**: 
  - Orbitron（標題字體）
  - Noto Sans TC（正文字體）
- **Font Awesome 6.4.0**: 圖標庫（Discord 圖標）
- **圖片資源**: 使用巴哈姆特論壇圖片連結

### 設計特色
- 🎨 霓虹燈風格（Neon Glow）
- 🌈 漸層文字效果與動畫
- 📱 完全響應式設計
- ⚡ 流暢的動畫過渡
- 🎭 動態粒子背景系統
- 🎬 打字機效果動畫
- 🎠 圖片輪播功能
- 🔍 SEO 優化（結構化數據、Open Graph）
- ♿ 可訪問性優化（ARIA 標籤、語義化）

## 📁 專案結構

```
bydsmp.com/
├── index.html                      # 主頁面檔案
├── assets/
│   ├── css/
│   │   ├── main.css               # 主樣式文件（導入所有樣式）
│   │   ├── variables.css          # CSS 變數定義
│   │   └── components/            # 組件樣式
│   │       ├── navigation.css     # 導航欄樣式（重新設計）
│   │       ├── hero.css           # Hero 區域樣式（動畫效果）
│   │       ├── sections.css       # 通用 section 樣式
│   │       ├── gallery.css        # 相冊樣式（輪播模式）
│   │       └── footer.css         # 頁腳樣式（重新設計）
│   ├── js/
│   │   ├── main.js                # 主入口文件
│   │   ├── config.js              # 配置文件（擴展設定）
│   │   └── modules/               # JavaScript 模組
│   │       ├── navigation.js     # 導航選單功能
│   │       ├── copyIP.js          # IP 複製功能（懸停效果）
│   │       ├── typewriter.js      # 打字機效果模組
│   │       ├── particleBackground.js # 粒子背景模組
│   │       ├── galleryCarousel.js  # 相冊輪播模組
│   │       └── backgroundSlider.js # 背景輪播功能（已移除）
│   └── images/                    # 本地圖片資源（如需要）
├── .cursor/
│   └── skills/
│       └── bydsmp-website/
│           └── SKILL.md          # 專案維護指南
└── README.md                      # 專案說明文件
```

## 🚀 使用方式

### 本地開發
1. 直接使用瀏覽器開啟 `index.html` 檔案即可
2. 或使用本地伺服器：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js (需安裝 http-server)
   npx http-server
   ```

### 部署
直接將整個專案上傳至任何靜態網站託管服務：
- GitHub Pages
- Netlify
- Vercel
- 傳統 Web 伺服器（Apache/Nginx）

**注意**: 確保所有 `assets/` 目錄下的文件都正確上傳。

## 🎨 自訂設定

### 修改配置
所有可配置的設定都在 `assets/js/config.js` 文件中：

```javascript
const CONFIG = {
    // 伺服器資訊
    serverIP: "bydsmp.com",
    serverName: "BYDSMP",
    
    // 外部連結
    discordLink: "https://discord.gg/2EDqgeRKPs",
    email: "bydsmp@gmail.com",
    
    // Hero 副標題標語（可擴充）
    heroSlogans: [
        "生存與 PVP 的完美結合",
        "探索無限可能",
        "競技與合作並存",
        "防噴生存 | 領地保護 | 戰力排行",
        "加入我們 | 開啟你的 Minecraft 冒險之旅"
    ],
    
    // 打字機效果設定
    typewriterSpeed: 100,              // 每個字符顯示速度（毫秒）
    typewriterDeleteSpeed: 50,         // 刪除字符速度（毫秒）
    typewriterPauseBeforeDelete: 2000, // 刪除前暫停時間（毫秒）
    typewriterPauseAfterDelete: 500,   // 刪除後暫停時間（毫秒）
    
    // IP 複製功能
    copySuccessText: "已複製",
    copyResetDelay: 3000,              // 恢復延遲（毫秒）
    
    // 相冊輪播設定
    galleryAutoPlay: true,              // 自動播放
    galleryInterval: 5000,              // 自動切換間隔（毫秒）
    galleryTransitionDuration: 500,    // 切換動畫持續時間（毫秒）
    galleryPauseOnHover: true          // 懸停時暫停
};
```

### 修改顏色主題
在 `assets/css/variables.css` 中修改：

```css
:root {
    --primary-color: #FF79BC;      /* 主色調 */
    --primary-light: #ffb3d9;      /* 淺色調 */
    --primary-dark: #ff4da6;       /* 深色調 */
    --bg-dark: #121212;            /* 背景深色 */
    /* ... 更多變數 */
}
```

### 添加新的組件樣式
1. 在 `assets/css/components/` 創建新的 CSS 文件
2. 在 `assets/css/main.css` 中添加 `@import` 語句

### 添加新的 JavaScript 功能
1. 在 `assets/js/modules/` 創建新的模組文件
2. 在 `index.html` 中添加 `<script>` 標籤引用

## 📱 響應式設計

網站已針對以下裝置進行優化：
- 📱 手機（< 768px）
- 💻 平板（768px - 1024px）
- 🖥️ 桌面（> 1024px）

移動端功能：
- 漢堡選單（Hamburger Menu）
- 觸控友善的按鈕大小
- 自適應圖片和文字大小
- 觸摸滑動支持（相冊輪播）

## 🔧 功能說明

### Hero 區塊功能

#### IP 複製功能
- 點擊 IP 按鈕自動複製伺服器 IP 到剪貼簿
- 懸停時顯示「點擊複製連線位置」
- 點擊後顯示「已複製」，3 秒後自動恢復
- 支援現代瀏覽器的 Clipboard API
- 提供舊版瀏覽器的降級方案

#### 打字機效果副標
- 5 個標語自動循環顯示
- 逐字顯示和刪除動畫
- 閃爍游標效果
- 可在 `config.js` 中擴充標語

#### 粒子背景
- Canvas 繪製的動態粒子系統
- 80 個漂浮粒子
- 粒子距離小於 150px 時自動連線
- 線條透明度根據距離動態調整
- 背景固定不隨頁面滾動

#### 標題動畫
- 漸變動畫：4 秒循環，漸變在四個方向移動
- 浮動動畫：6 秒循環，上下浮動並輕微旋轉
- 縮放動畫：8 秒循環，輕微放大縮小

### 導航選單
- 固定頂部導航列
- 導航連結靠右對齊
- Discord 圓形圖標按鈕（Font Awesome）
- 平滑滾動錨點連結
- 移動端漢堡選單
- 鍵盤導航支援
- 懸停動畫效果

### 相冊輪播
- **自動播放**: 每 5 秒自動切換
- **手動控制**: 上一張/下一張按鈕（透明背景）
- **指示器**: 點擊直接跳轉到指定圖片
- **切換動畫**: 流暢的滑入/滑出效果
- **觸摸支持**: 移動設備滑動切換
- **鍵盤導航**: 左右箭頭鍵切換
- **懸停暫停**: 滑鼠懸停時暫停自動播放
- **圖片預載**: 自動預載下一張圖片

### Footer
- 漸變背景設計
- 頂部裝飾線
- 改進的視覺層次
- 連結懸停動畫效果

## 🔍 SEO 優化

- ✅ 完整的 meta 標籤（description、keywords、author）
- ✅ Open Graph 標籤（Facebook 分享優化）
- ✅ Twitter Card 標籤（Twitter 分享優化）
- ✅ JSON-LD 結構化數據（Organization、WebSite）
- ✅ 語義化 HTML5 標籤
- ✅ 適當的 heading 層級結構

## ♿ 可訪問性優化

- ✅ ARIA 標籤（`aria-label`、`aria-expanded`、`role`）
- ✅ 語義化 HTML 標籤（`<nav>`、`<article>`、`<footer>`）
- ✅ 鍵盤導航支援
- ✅ 圖片 alt 文字
- ✅ 適當的對比度

## 📝 維護建議

1. **定期更新圖片連結**: 確保所有圖片連結有效
2. **檢查規則內容**: 根據伺服器規則變更更新規則區塊
3. **更新相冊**: 在 `index.html` 中添加新的 `.gallery-slide` 元素
4. **擴充標語**: 在 `config.js` 的 `heroSlogans` 陣列中添加新標語
5. **測試響應式**: 在不同裝置上測試網站顯示效果
6. **優化圖片**: 確保圖片載入速度，可考慮使用 CDN
7. **更新配置**: 修改 `config.js` 來更新伺服器資訊和功能設定，無需修改 HTML

## 🏗️ 架構優勢

### 模組化設計
- CSS 和 JavaScript 按功能分離，易於維護和擴展
- 配置文件集中管理，修改設定更方便
- 每個功能獨立模組，互不干擾

### 性能優化
- 圖片懶加載減少初始載入時間
- 資源預載入（preconnect、dns-prefetch）
- Canvas 動畫使用 requestAnimationFrame 優化
- 模組化代碼便於瀏覽器緩存

### 可維護性
- 清晰的目錄結構
- 代碼組織邏輯明確
- 易於添加新功能
- 配置與代碼分離

### 動畫與互動
- 豐富的 CSS 動畫效果
- Canvas 粒子系統
- 打字機效果
- 輪播功能
- 流暢的過渡動畫

## 🎨 設計亮點

### Hero 區塊
- 動態標題多重動畫效果
- 打字機效果副標題
- 現代化 IP 按鈕設計
- 漂浮點粒子背景

### 導航欄
- 現代化設計風格
- 導航連結靠右對齊
- Discord 圖標按鈕
- 懸停動畫效果

### 相冊
- 輪播模式展示
- 流暢的切換動畫
- 多種控制方式
- 響應式設計

### Footer
- 漸變背景
- 改進的視覺層次
- 連結動畫效果

## 📄 授權與聲明

本網站與 BYDSMP 伺服器為非官方粉絲創作，與 Mojang Studios 或 Microsoft 無關。

**NOT OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

## 📞 聯絡資訊

- **Discord**: [加入 Discord 社群](https://discord.gg/2EDqgeRKPs)
- **Email**: bydsmp@gmail.com
- **伺服器 IP**: bydsmp.com

---

© 2026 BYDSMP. All Rights Reserved.
