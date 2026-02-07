# BYDSMP 官方網站

BYDSMP 是一個台灣 Minecraft 伺服器的官方網站，提供伺服器資訊、遊戲分流介紹、規則說明和贊助支持等功能。

## 📋 專案簡介

這是一個單頁面（Single Page Application）網站，採用模組化的 HTML、CSS 和 JavaScript 架構開發。網站採用現代化的霓虹燈風格設計，提供流暢的使用者體驗，並針對 SEO、性能和可訪問性進行了優化。

## 🎮 伺服器資訊

- **伺服器名稱**: BYDSMP
- **伺服器 IP**: bydsmp.com
- **Discord**: [加入 Discord](https://discord.gg/2EDqgeRKPs)
- **聯絡信箱**: bydsmp@gmail.com

## 🎯 主要功能

### 1. 遊戲分流介紹
- **SMP 生存分流**: 防噴生存、全新地形、領地系統、友好社交環境
- **KitPVP 競技分流**: 戰力系統、沙箱場地、嚴格防掛、多種 PVP 模式

### 2. 伺服器相冊
展示伺服器內的精彩截圖，包含 15 張遊戲畫面圖片，支援懶加載優化。

### 3. 伺服器規則
詳細說明伺服器規則，包括：
- 基本規則
- 世界規則
- 生電規則
- PVP 規則
- 違規處理

### 4. 贊助支持
提供純贊助支持功能，包含完整的免責聲明。

## 🛠️ 技術架構

### 前端技術
- **HTML5**: 語義化標籤結構，完整的 SEO meta 標籤
- **CSS3**: 
  - 模組化 CSS 架構
  - CSS 變數（Custom Properties）
  - Flexbox 和 Grid 佈局
  - 響應式設計（RWD）
  - 動畫和過渡效果
- **JavaScript (Vanilla)**: 
  - 模組化 JavaScript 架構
  - DOM 操作
  - 事件處理
  - 剪貼簿 API
  - 背景圖片輪播

### 外部資源
- **Google Fonts**: 
  - Orbitron（標題字體）
  - Noto Sans TC（正文字體）
- **圖片資源**: 使用巴哈姆特論壇圖片連結

### 設計特色
- 🎨 霓虹燈風格（Neon Glow）
- 🌈 漸層文字效果
- 📱 完全響應式設計
- ⚡ 流暢的動畫過渡
- 🎭 背景圖片自動輪播
- 🔍 SEO 優化（結構化數據、Open Graph）
- ♿ 可訪問性優化（ARIA 標籤、語義化）

## 📁 專案結構

```
bydsmp.com/
├── index.html                      # 主頁面檔案（精簡後）
├── assets/
│   ├── css/
│   │   ├── main.css               # 主樣式文件（導入所有樣式）
│   │   ├── variables.css          # CSS 變數定義
│   │   └── components/            # 組件樣式
│   │       ├── navigation.css     # 導航欄樣式
│   │       ├── hero.css           # Hero 區域樣式
│   │       ├── sections.css       # 通用 section 樣式
│   │       ├── gallery.css        # 相冊樣式
│   │       └── footer.css         # 頁腳樣式
│   ├── js/
│   │   ├── main.js                # 主入口文件
│   │   ├── config.js              # 配置文件（伺服器資訊、設定）
│   │   └── modules/               # JavaScript 模組
│   │       ├── navigation.js      # 導航選單功能
│   │       ├── copyIP.js          # IP 複製功能
│   │       └── backgroundSlider.js # 背景輪播功能
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
    serverIP: "bydsmp.com",           // 伺服器 IP
    discordLink: "https://...",       // Discord 連結
    backgroundImages: [...],          // 背景圖片陣列
    sliderInterval: 7000,              // 輪播間隔（毫秒）
    // ... 更多設定
};
```

### 修改顏色主題
在 `assets/css/variables.css` 中修改：

```css
:root {
    --primary-color: #FF79BC;      /* 主色調 */
    --primary-light: #ffb3d9;      /* 淺色調 */
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

## 🔧 功能說明

### IP 複製功能
點擊首頁的 IP 框即可自動複製伺服器 IP 到剪貼簿，並顯示確認訊息。支援現代瀏覽器的 Clipboard API，並提供舊版瀏覽器的降級方案。

### 導航選單
- 固定頂部導航列
- 平滑滾動錨點連結
- 移動端漢堡選單
- 鍵盤導航支援

### 背景輪播
首頁 Hero 區域會自動輪播背景圖片，預設每 7 秒切換一次。圖片會預先載入以確保流暢切換。

### 圖片懶加載
相冊中的所有圖片都使用 `loading="lazy"` 屬性，只在需要時才載入，提升頁面載入速度。

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
3. **更新相冊**: 定期新增伺服器精彩截圖
4. **測試響應式**: 在不同裝置上測試網站顯示效果
5. **優化圖片**: 確保圖片載入速度，可考慮使用 CDN
6. **更新配置**: 修改 `config.js` 來更新伺服器資訊，無需修改 HTML

## 🏗️ 架構優勢

### 模組化設計
- CSS 和 JavaScript 按功能分離，易於維護和擴展
- 配置文件集中管理，修改設定更方便

### 性能優化
- 圖片懶加載減少初始載入時間
- 資源預載入（preconnect、dns-prefetch）
- 模組化代碼便於瀏覽器緩存

### 可維護性
- 清晰的目錄結構
- 代碼組織邏輯明確
- 易於添加新功能

## 📄 授權與聲明

本網站與 BYDSMP 伺服器為非官方粉絲創作，與 Mojang Studios 或 Microsoft 無關。

**NOT OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

## 📞 聯絡資訊

- **Discord**: [加入 Discord 社群](https://discord.gg/2EDqgeRKPs)
- **Email**: bydsmp@gmail.com
- **伺服器 IP**: bydsmp.com

---

© 2026 BYDSMP. All Rights Reserved.
