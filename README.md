# BYDSMP 官方網站

台灣 Minecraft PvP 伺服器 BYDSMP 的官方網站（[bydsmp.com](https://bydsmp.com)）。首頁目前只有 Hero，另有規則、贊助與 Duel 排行榜頁。

純靜態網站：HTML5 + CSS3 + Vanilla JavaScript，沒有框架、沒有建置步驟，部署在 Vercel。唯一的伺服端程式是排行榜用的 Vercel Function（`api/leaderboard.mjs`）。

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
| 首頁 | `index.html` | Hero（複製 IP、Discord、線上人數） |
| 規則 | `rules.html` | 分頁：基本、PvP、世界、生電、違規處理；支援 `/rules#tab-pvp` 直接連結 |
| 贊助 | `sponsor.html` | VIP 方案、贊助名單（讀 `docs/sponsors.json`）、Discord CTA |
| Duel 排行榜 | `leaderboard.html` | 排隊局天梯前 100 名、模式／排序切換、搜尋玩家；狀態寫在網址 `?ladder=&sort=` |

## 專案結構

```
├── index.html / rules.html / sponsor.html / leaderboard.html
├── api/leaderboard.mjs            # Vercel Function：轉送 Bydsmp-Leaderboard 插件的唯讀 API
├── sitemap.xml / robots.txt / vercel.json / .vercelignore
├── assets/
│   ├── css/
│   │   ├── variables.css          # 設計 token（顏色、字體、間距、斜切角）
│   │   ├── base.css               # 重置、排版、按鈕、區塊標頭、reduced-motion
│   │   └── components/
│   │       ├── navigation.css     # 固定導覽列 + 行動版選單
│   │       ├── footer.css         # 頁尾
│   │       ├── home.css           # 首頁 Hero
│   │       ├── rules.css          # 規則頁
│   │       ├── sponsor.css        # 贊助頁
│   │       └── leaderboard.css    # Duel 排行榜頁
│   ├── js/
│   │   ├── config.js              # 站點設定（最先載入）
│   │   ├── main.js                # 把 CONFIG 綁到 data-config-* 元素（最後載入）
│   │   └── modules/
│   │       ├── navigation.js      # 捲動後導覽列變實底、漢堡選單
│   │       ├── copyIP.js          # 點任一 .ip-box 複製 IP
│   │       ├── serverStatus.js    # mcsrvstat.us 線上人數
│   │       ├── rulesTabs.js       # 規則分頁
│   │       ├── sponsorLeaderboard.js
│   │       └── leaderboard.js     # Duel 排行榜頁
│   └── images/
│       ├── icons.svg              # SVG 圖示 sprite（Lucide ISC + Simple Icons CC0）
│       └── logo.png、hero_background.png
├── docs/sponsors.json             # 贊助紀錄
└── tests/                         # Vitest + jsdom
```

## 開發

```bash
python -m http.server 8000   # 需要 HTTP（file:// 會擋 Clipboard API 與 SVG sprite）
npm test                     # 全部測試
```

`tests/unit/sharedLayout.test.js` 會檢查四頁的導覽列與頁尾一致、引用的檔案與圖示都存在、SEO 標籤齊全；改導覽列或頁尾時四頁要一起改。

## Duel 排行榜

```
瀏覽器 ──GET /api/leaderboard?view=meta|board|find──▶ Vercel Function（CDN 快取 60 秒）
                                                      │ X-Bydsmp-Token
                                                      ▼
                                   PvP 服 Bydsmp-Leaderboard 插件  http://<主機>:<埠>/api/*
```

- 瀏覽器不直連主機：bydsmp.com 是 HTTPS，直打 `http://主機:埠` 會被 mixed content 擋，也會暴露主機位址與密鑰。
- 名次、排序都由插件算好，網頁只照 `rank` 畫；模式與可用排序從 `meta` 取，Duel 新增天梯不用改網站。
- 契約在 [MrPippi/Bydsmp](https://github.com/MrPippi/Bydsmp) 的 `docs/superpowers/specs/2026-10-08-leaderboard-web-api-design.md` 與 `…-leaderboard-website-page-design.md`。

上線步驟：

1. PvP 服依插件 `docs/server-context.md`「Leaderboard 網頁 API」開埠並設定 `web:`；`curl -H "X-Bydsmp-Token: …" http://<IP>:<埠>/api/meta` 看得到天梯。
2. Vercel 專案設定環境變數 `LEADERBOARD_ORIGIN`（`http://<IP>:<埠>`，不帶結尾斜線）與 `LEADERBOARD_TOKEN`（與插件 `web.token` 相同）。
3. 部署後確認 `/api/leaderboard?view=meta` 回 200，第二次請求的 `x-vercel-cache` 為 `HIT`。

沒設環境變數時 Function 回 500，頁面顯示「排行榜暫時無法取得」，不影響其他頁。本機 `python -m http.server` 跑不了 Function，要測請用 `npx vercel dev`。

## 授權與聲明

BYDSMP 為玩家自營伺服器，與 Mojang Studios 或 Microsoft 無關。**NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.**

© 2026 BYDSMP. All Rights Reserved.
