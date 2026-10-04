# BYDSMP 官方網站

台灣 Minecraft PvP 伺服器 BYDSMP 的官方網站（[bydsmp.com](https://bydsmp.com)）。以 PvP 競技分流為主打，介紹排隊天梯、FFA、決鬥模式與 SMP 生存分流，並提供規則與贊助頁。

純靜態網站：HTML5 + CSS3 + Vanilla JavaScript，沒有框架、沒有建置步驟，部署在 Vercel。

## 伺服器資訊

| 項目 | 資訊 |
|------|------|
| 伺服器 IP | bydsmp.com（PvP 與 SMP 同一個入口，資料互不相通） |
| 版本 | Java 版，建議 1.21.11 |
| Discord | [加入 Discord](https://discord.gg/2EDqgeRKPs) |
| 聯絡信箱 | bydsmp@gmail.com |

## 頁面

| 頁面 | 檔案 | 內容 |
|------|------|------|
| 首頁 | `index.html` | Hero（複製 IP、線上人數）→ 01 PvP 系統 → 02 決鬥模式與競技場 → 03 分流介紹 → 04 加入方式 |
| 規則 | `rules.html` | 分頁：基本、PvP、世界、生電、違規處理；支援 `/rules#tab-pvp` 直接連結 |
| 贊助 | `sponsor.html` | VIP 方案、贊助名單（讀 `docs/sponsors.json`）、Discord CTA |

首頁的 PvP／SMP 內容對照 [MrPippi/Bydsmp](https://github.com/MrPippi/Bydsmp) 的插件（Duel、Ffa、Tiers、Practice、Rtp、Friends、FastCrystal、Report、Settings；SMP 的 Auction、DailySignin、Quest、PlayerWarp、Catcher、ResFly、AfkPool、ItemWorth）。伺服器新增或移除玩法時，記得一起更新首頁。

## 專案結構

```
├── index.html / rules.html / sponsor.html
├── sitemap.xml / robots.txt / vercel.json / .vercelignore
├── assets/
│   ├── css/
│   │   ├── variables.css          # 設計 token（顏色、字體、間距、斜切角）
│   │   ├── base.css               # 重置、排版、按鈕、區塊標頭、reveal、reduced-motion
│   │   └── components/
│   │       ├── navigation.css     # 固定導覽列 + 行動版選單
│   │       ├── footer.css         # 頁尾
│   │       ├── home.css           # 首頁各區塊
│   │       ├── rules.css          # 規則頁
│   │       └── sponsor.css        # 贊助頁
│   ├── js/
│   │   ├── config.js              # 站點設定（最先載入）
│   │   ├── main.js                # 把 CONFIG 綁到 data-config-* 元素（最後載入）
│   │   └── modules/
│   │       ├── navigation.js      # 捲動後導覽列變實底、漢堡選單
│   │       ├── copyIP.js          # 點任一 .ip-box 複製 IP
│   │       ├── reveal.js          # [data-reveal] 進場動畫
│   │       ├── serverStatus.js    # mcsrvstat.us 線上人數
│   │       ├── rulesTabs.js       # 規則分頁
│   │       └── sponsorLeaderboard.js
│   └── images/
│       ├── icons.svg              # SVG 圖示 sprite（Lucide ISC + Simple Icons CC0）
│       └── logo.png、hero_background.png、*_background.webp、Iron_Pickaxe.png、Netherite_Sword.png
├── docs/sponsors.json             # 贊助紀錄
└── tests/                         # Vitest + jsdom
```

## 開發

```bash
python -m http.server 8000   # 需要 HTTP（file:// 會擋 Clipboard API 與 SVG sprite）
npm test                     # 全部測試
```

`tests/unit/sharedLayout.test.js` 會檢查三頁的導覽列與頁尾一致、引用的檔案與圖示都存在、SEO 標籤齊全；改導覽列或頁尾時三頁要一起改。

## 授權與聲明

BYDSMP 為玩家自營伺服器，與 Mojang Studios 或 Microsoft 無關。**NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

© 2026 BYDSMP. All Rights Reserved.
