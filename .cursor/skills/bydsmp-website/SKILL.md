---
name: bydsmp-website
description: Maintains and updates the BYDSMP Minecraft server website. Use when updating server information, rules, gallery images, game modes, or modifying website content and styling.
---

# BYDSMP Website Maintenance

## Project Overview

This is a modular multi-page HTML website for the BYDSMP Minecraft server. The project uses a modern architecture with separated CSS and JavaScript modules.

## File Structure

```
bydsmp.com/
├── index.html                      # Home page
├── rules.html                      # Rules page (tabs)
├── sponsor.html                    # Sponsor / VIP page（含贊助名單）
├── sitemap.xml
├── robots.txt
├── docs/
│   ├── sponsors.json               # 贊助紀錄資料（新增贊助時修改此檔）
│   └── TEST_COVERAGE_ANALYSIS.md
├── assets/
│   ├── css/
│   │   ├── main.css               # Main stylesheet (imports all)
│   │   ├── variables.css          # CSS variables
│   │   └── components/
│   │       ├── navigation.css
│   │       ├── hero.css
│   │       ├── sections.css       # 通用 section + modes + responsive
│   │       ├── gallery.css
│   │       ├── footer.css
│   │       ├── rules.css          # .subpage 共用基礎、.rule-box、rules 分頁
│   │       └── sponsor.css        # 贊助頁專屬樣式（含贊助名單卡片）
│   ├── js/
│   │   ├── main.js                # Config 值注入（footer IP/email、Discord 連結）
│   │   ├── config.js              # 集中管理 serverIP、email、discordLink 等
│   │   └── modules/
│   │       ├── navigation.js      # data-nav="always-visible" 控制滾動隱藏
│   │       ├── copyIP.js
│   │       ├── galleryCarousel.js
│   │       ├── modesScroll.js
│   │       ├── rulesTabs.js
│   │       └── sponsorLeaderboard.js  # 讀取 sponsors.json，渲染贊助統計卡片
│   └── images/
└── .cursor/skills/bydsmp-website/  # This skill directory
    └── add-sponsor/
        └── SKILL.md               # 添加贊助名單的完整指南
```

## Key Sections

### index.html
1. **#home** - Hero section with server IP and title
2. **#modes** - Game modes (SMP and KitPVP)
3. **#gallery** - Server screenshot gallery (carousel)

### rules.html
- Server rules with tabs: 基本規則、世界規則、生電規則、PVP 規則、違規處理

### sponsor.html
- 贊助名單（三項統計卡片：近期贊助、最高單筆、最高贊助總額，含 Minotar 頭像）
- VIP 等級贊助說明、福利表格、贊助 CTA 與重要說明

### Navigation
- Header: Brand (BYDSMP)、規則、贊助支持、Discord 按鈕
- Home page: Header hidden by default, shows on scroll (frosted glass)
- Rules / Sponsor page: Header always visible

## Common Update Tasks

### Updating Sponsor List（更新贊助名單）

贊助名單資料集中儲存於 `docs/sponsors.json`。`sponsorLeaderboard.js` 在頁面載入時讀取此檔案，自動計算三個統計卡片：

- **近期贊助**：最新 3 筆（依 `date` 降序）
- **最高單筆**：單次 `amount` 最高的紀錄
- **最高贊助總額**：相同 `id` 的 `amount` 累計最高

**新增一筆贊助**：

```json
{ "id": "PlayerID", "name": "PlayerID", "amount": 400, "date": "YYYY-MM-DD" }
```

詳細步驟、欄位說明與注意事項請參考專屬指南：**`.cursor/skills/bydsmp-website/add-sponsor/SKILL.md`**

---

### Updating Server Information

**Recommended**: Update `assets/js/config.js` - all server info is centralized here:
- `serverIP`: Server IP address
- `discordLink`: Discord invite link
- `email`: Contact email

`main.js` 在每頁 DOM ready 後自動將 CONFIG 值注入至 footer（`#footer-server-ip`、`#footer-email`）、nav Discord 按鈕（`#nav-discord-btn`）及贊助 CTA（`#sponsor-cta-link`）。更新 `config.js` 即可同步所有頁面，無需手動修改 HTML。

### Updating Gallery Images

Gallery images are in `#gallery` section of `index.html`. Each image is in a `.gallery-slide` div:

```html
<div class="gallery-slide" role="listitem">
    <img src="圖片網址" alt="描述" loading="lazy" width="800" height="600">
</div>
```

To add/remove images: Add new `.gallery-slide` divs inside `.gallery-carousel`. Use `loading="lazy"` for images after the first.

### Updating Rules

Rules are in `rules.html`. Each rule category has its own tab panel with `.rule-box`:

- 基本規則 (tab-basic)
- 世界規則 (tab-world)
- 生電規則 (tab-redstone)
- PVP 規則 (tab-pvp)
- 違規處理 (tab-violation)

Update the `<ul class="rule-list">` content within each `.rules-panel` article.

### Updating Game Modes

Game mode cards are in `#modes` section of `index.html`. Each mode is an `<article class="mode-card">` with:
- `<h3>` title
- `<ul>` list of features

### Updating Colors/Theme

CSS variables are defined in `assets/css/variables.css`:

```css
:root {
    --primary-color: #FF79BC;
    --primary-light: #ffb3d9;
    --bg-dark: #121212;
    --bg-card: #1e1e1e;
    --text-main: #ffffff;
    --text-muted: #b0b0b0;
}
```

Modify these to change the color scheme globally.

### Updating Hero Background

Hero background image is set in `assets/css/components/hero.css`:
`background-image: url("../../images/hero_background.png");`
Replace the image file to update.

### Updating Navigation

Navigation HTML 存在於三頁（index、rules、sponsor），結構相同。Discord 按鈕 href 由 `main.js` 從 `CONFIG.discordLink` 注入，無需手動修改。

若新增子頁面（非 index 首頁），在 `<nav>` 加上 `data-nav="always-visible"` 即可讓 navigation 保持常態顯示，無需修改 JS。

### Updating Meta Tags

SEO meta tags are in `<head>` of each page:
- **index.html**: Full set (description, keywords, og, twitter, theme-color)
- **rules.html** / **sponsor.html**: description, keywords, og, twitter, theme-color, language

Update when changing site content or adding new features.

## Design Guidelines

- **Color Scheme**: Pink neon theme (#FF79BC primary)
- **Fonts**: 
  - Orbitron for headings (futuristic)
  - Noto Sans TC for body text (Chinese support)
- **Responsive**: Mobile-first design with hamburger menu for < 768px
- **Animations**: Smooth transitions (0.3s default), neon glow effects

## Code Style

- **CSS**: Modular files in `assets/css/components/`
- **JavaScript**: IIFE modules in `assets/js/modules/`
- **HTML**: Semantic HTML5 structure
- **Language**: Traditional Chinese (zh-TW)

## Architecture Benefits

### Modular CSS
- Each component has its own CSS file
- Easy to locate and modify specific styles
- Variables centralized in `variables.css`

### Modular JavaScript
- Each feature is a separate module
- Configuration centralized in `config.js`
- Self-initializing modules (no manual initialization needed)

### Performance Optimizations
- Image lazy loading (`loading="lazy"`)
- Resource preloading (preconnect, dns-prefetch)
- Optimized font loading

### SEO & Accessibility
- Complete meta tags
- Structured data (JSON-LD)
- ARIA labels and semantic HTML
- Keyboard navigation support

## Testing Checklist

After making changes:
- [ ] Check sponsor leaderboard renders (open sponsor.html via local server, verify 3 cards appear)
- [ ] Test IP copy functionality (index)
- [ ] Verify all images load correctly
- [ ] Check responsive design on mobile (< 768px)
- [ ] Test navigation (規則、贊助支持、Discord、hamburger on mobile)
- [ ] Test rules page tabs and URL hash
- [ ] Test sponsor page table and CTA link
- [ ] Validate HTML structure
- [ ] Test keyboard navigation
- [ ] Verify ARIA labels are correct

## Important Notes

- All images are hosted externally (Bahamut forum)
- Configuration is centralized in `assets/js/config.js`
- Website uses vanilla JavaScript (no frameworks)
- Discord link: https://discord.gg/2EDqgeRKPs
- Contact email: bydsmp@gmail.com
- Server IP: bydsmp.com

## Maintenance Tips

1. **Configuration First**: Always check `config.js` before making manual updates
2. **Image Links**: Regularly check that external image URLs are still valid
3. **Rules Updates**: Keep rules synchronized with actual server rules
4. **Gallery**: Add new screenshots periodically to showcase server
5. **Performance**: Ensure images use `loading="lazy"` attribute
6. **Accessibility**: Maintain ARIA labels and semantic HTML structure
7. **SEO**: Update meta tags when content changes significantly

## Adding New Features

### Adding a New Section

1. Add HTML structure to `index.html`
2. Create CSS file in `assets/css/components/`
3. Import CSS in `assets/css/main.css`
4. Add navigation link if needed

### Adding New JavaScript Functionality

1. Create module file in `assets/js/modules/`
2. Use IIFE pattern (see existing modules)
3. Add `<script>` tag before closing `</body>`（確保在 `config.js` 之後、`main.js` 之前）
4. Module will auto-initialize on DOM ready

### Adding a New Subpage

1. 複製 `rules.html` 或 `sponsor.html` 的 `<head>` 結構作為起點
2. `<nav>` 加上 `data-nav="always-visible"`（nav 永遠顯示）
3. `<main>` 加上 `class="subpage"` 以套用共用頂部留白
4. Scripts 依序：`config.js` → `navigation.js` → （頁面模組）→ `main.js`

### Modifying Styles

- **Global changes**: Edit `assets/css/variables.css`
- **Component changes**: Edit corresponding file in `assets/css/components/`
- **New component**: Create new file and import in `main.css`
