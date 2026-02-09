# BYDSMP 官方網站

台灣 Minecraft 伺服器的官方網站，提供伺服器資訊、遊戲分流介紹、規則說明與贊助支持。

## 專案概述

本專案為多頁面靜態網站，採用模組化 HTML、CSS、JavaScript 架構，深色主題搭配粉紅霓虹風格，並具備響應式設計與 SEO 優化。

## 伺服器資訊

| 項目 | 資訊 |
|------|------|
| 伺服器名稱 | BYDSMP |
| 伺服器 IP | bydsmp.com |
| Discord | [加入 Discord](https://discord.gg/2EDqgeRKPs) |
| 聯絡信箱 | bydsmp@gmail.com |

## 網站架構

### 頁面結構

| 頁面 | 路徑 | 說明 |
|------|------|------|
| 首頁 | `index.html` | Hero、遊戲分流、相冊、贊助 |
| 規則 | `rules.html` | 伺服器規則（分頁設計） |

### 導覽列（Header）

- **品牌連結**：BYDSMP，連結至首頁
- **規則**：連結至 `rules.html`
- **Discord**：外部連結至 Discord 社群
- 首頁：Header 預設隱藏，滑動後顯示（毛玻璃效果）
- 規則頁：Header 預設顯示

## 專案結構

```
bydsmp.com/
├── index.html                 # 首頁
├── rules.html                 # 規則頁面
├── sitemap.xml                # 網站地圖
├── robots.txt                 # 爬蟲規則
├── README.md
├── assets/
│   ├── css/
│   │   ├── main.css           # 主樣式（導入所有組件）
│   │   ├── variables.css      # CSS 變數
│   │   └── components/
│   │       ├── navigation.css # 導覽列
│   │       ├── hero.css       # Hero 區塊
│   │       ├── sections.css   # 通用區塊（分流、贊助）
│   │       ├── gallery.css    # 相冊輪播
│   │       ├── footer.css     # 頁尾
│   │       └── rules.css      # 規則頁面
│   ├── js/
│   │   ├── main.js            # 主入口
│   │   ├── config.js          # 設定檔
│   │   └── modules/
│   │       ├── navigation.js  # 導覽行為（顯示/隱藏、漢堡選單）
│   │       ├── copyIP.js      # 複製 IP 功能
│   │       ├── galleryCarousel.js  # 相冊輪播
│   │       └── rulesTabs.js   # 規則分頁切換
│   └── images/
│       ├── logo.png
│       ├── hero_background.png
│       └── icon_item_totem_of_undying.png
└── .cursor/skills/bydsmp-website/
    └── SKILL.md               # 專案維護指南
```

## 技術棧

- **HTML5**：語義化標籤、SEO meta
- **CSS3**：變數、Flexbox、Grid、RWD、backdrop-filter
- **JavaScript (Vanilla)**：模組化、DOM、Clipboard API
- **字體**：Orbitron（標題）、Noto Sans TC（內文）
- **圖標**：Font Awesome 6.4.0

## 主要功能

### 首頁（index.html）

1. **Hero**：Logo、標語、立即遊玩按鈕（點擊複製 IP）、背景圖
2. **遊戲分流**：SMP 生存、KitPVP 競技卡片
3. **相冊**：輪播、自動播放、手動切換、指示器
4. **贊助**：純贊助說明與免責聲明

### 規則頁（rules.html）

1. **分頁**：基本規則、世界規則、生電規則、PVP 規則、違規處理
2. **URL Hash**：支援 `rules.html#tab-pvp` 等直接連結
3. **標題上方留白**：配合固定 Header 的 padding

## 設定檔（config.js）

```javascript
const CONFIG = {
    serverIP: "bydsmp.com",
    discordLink: "https://discord.gg/2EDqgeRKPs",
    email: "bydsmp@gmail.com",
    copyResetDelay: 3000,
    galleryAutoPlay: true,
    galleryInterval: 5000,
    galleryPauseOnHover: true
};
```

## 本地開發

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

開啟 `http://localhost:8000` 檢視網站。

## 部署

將專案上傳至靜態託管服務（如 GitHub Pages、Netlify、Vercel），或傳統 Web 伺服器（Apache/Nginx）。

## 響應式斷點

| 裝置 | 斷點 |
|------|------|
| 手機 | < 768px |
| 平板 | 768px - 1024px |
| 桌面 | > 1024px |

## 授權與聲明

本網站與 BYDSMP 伺服器為非官方粉絲創作，與 Mojang Studios 或 Microsoft 無關。

**NOT OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

---

© 2026 BYDSMP. All Rights Reserved.
