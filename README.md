# BYDSMP 官方網站

BYDSMP 是一個台灣 Minecraft 伺服器的官方網站，提供伺服器資訊、遊戲分流介紹、規則說明和贊助支持等功能。

## 📋 專案簡介

這是一個單頁面（Single Page Application）網站，採用純 HTML、CSS 和 JavaScript 開發，無需任何構建工具或框架。網站採用現代化的霓虹燈風格設計，提供流暢的使用者體驗。

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
展示伺服器內的精彩截圖，包含 15 張遊戲畫面圖片。

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
- **HTML5**: 語義化標籤結構
- **CSS3**: 
  - CSS 變數（Custom Properties）
  - Flexbox 和 Grid 佈局
  - 響應式設計（RWD）
  - 動畫和過渡效果
- **JavaScript (Vanilla)**: 
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

## 📁 專案結構

```
bydsmp.com/
├── index.html          # 主頁面檔案（包含所有 HTML、CSS、JavaScript）
└── README.md          # 專案說明文件
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
直接將 `index.html` 上傳至任何靜態網站託管服務：
- GitHub Pages
- Netlify
- Vercel
- 傳統 Web 伺服器（Apache/Nginx）

## 🎨 自訂設定

### 修改顏色主題
在 `index.html` 的 `:root` 變數中修改：

```css
:root {
    --primary-color: #FF79BC;      /* 主色調 */
    --primary-light: #ffb3d9;      /* 淺色調 */
    --bg-dark: #121212;            /* 背景深色 */
    --bg-card: #1e1e1e;            /* 卡片背景 */
    --text-main: #ffffff;          /* 主要文字 */
    --text-muted: #b0b0b0;         /* 次要文字 */
}
```

### 修改背景輪播圖片
在 JavaScript 區塊的 `bgImages` 陣列中修改：

```javascript
const bgImages = [
    '圖片網址 1',
    '圖片網址 2'
];
```

### 修改輪播間隔時間
修改 `setInterval` 的第二個參數（單位：毫秒）：

```javascript
setInterval(changeBackground, 7000); // 7000 = 7 秒
```

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
點擊首頁的 IP 框即可自動複製伺服器 IP 到剪貼簿，並顯示確認訊息。

### 導航選單
- 固定頂部導航列
- 平滑滾動錨點連結
- 移動端漢堡選單

### 背景輪播
首頁 Hero 區域會自動輪播背景圖片，預設每 7 秒切換一次。

## 📝 維護建議

1. **定期更新圖片連結**: 確保所有圖片連結有效
2. **檢查規則內容**: 根據伺服器規則變更更新規則區塊
3. **更新相冊**: 定期新增伺服器精彩截圖
4. **測試響應式**: 在不同裝置上測試網站顯示效果
5. **優化圖片**: 確保圖片載入速度，可考慮使用 CDN

## 📄 授權與聲明

本網站與 BYDSMP 伺服器為非官方粉絲創作，與 Mojang Studios 或 Microsoft 無關。

**NOT OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

## 📞 聯絡資訊

- **Discord**: [加入 Discord 社群](https://discord.gg/2EDqgeRKPs)
- **Email**: bydsmp@gmail.com
- **伺服器 IP**: bydsmp.com

---

© 2026 BYDSMP. All Rights Reserved.
