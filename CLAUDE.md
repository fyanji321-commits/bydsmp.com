# CLAUDE.md — BYDSMP Website

Official website for the BYDSMP Taiwan Minecraft server (`bydsmp.com`). A multi-page static website with no build step, no frameworks, and no package manager — just plain HTML5, CSS3, and Vanilla JavaScript.

---

## Project Structure

```
bydsmp.com/
├── index.html              # Home page (hero, game modes, gallery)
├── rules.html              # Server rules (tabbed layout)
├── sponsor.html            # VIP sponsorship info
├── sitemap.xml
├── robots.txt
├── README.md
├── assets/
│   ├── css/
│   │   ├── main.css        # Entry stylesheet — imports everything via @import
│   │   ├── variables.css   # All CSS custom properties (colors, spacing, fonts)
│   │   └── components/
│   │       ├── navigation.css
│   │       ├── hero.css
│   │       ├── sections.css   # Game mode cards
│   │       ├── gallery.css    # Carousel
│   │       ├── footer.css
│   │       ├── rules.css
│   │       └── sponsor.css
│   ├── js/
│   │   ├── config.js          # Global CONFIG object (server info, timings)
│   │   ├── main.js            # Entry point — exposes CONFIG to window
│   │   └── modules/
│   │       ├── navigation.js      # Scroll-hide nav, hamburger menu
│   │       ├── copyIP.js          # Clipboard copy with toast feedback
│   │       ├── galleryCarousel.js # Image carousel (auto-play, swipe, keyboard)
│   │       ├── modesScroll.js     # IntersectionObserver scroll animation
│   │       ├── rulesTabs.js       # Tab switching with URL hash support
│   │       ├── backgroundSlider.js  # (unused — legacy)
│   │       ├── particleBackground.js # (unused — legacy)
│   │       └── typewriter.js        # (unused — legacy)
│   └── images/
│       ├── logo.png
│       ├── hero_background.png
│       ├── Iron_Pickaxe.png
│       ├── Netherite_Sword.png
│       ├── kitpvp_background.png
│       ├── smp_background.png
│       └── icon_item_totem_of_undying.png
└── .cursor/skills/bydsmp-website/SKILL.md  # Cursor AI skill definition
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| HTML       | HTML5 semantic, `lang="zh-TW"`          |
| CSS        | CSS3 — variables, Flexbox, Grid, `backdrop-filter` |
| JavaScript | Vanilla ES5/ES6 — IIFE modules, no bundler |
| Fonts      | Orbitron (headings), Noto Sans TC (body) via Google Fonts |
| Icons      | Font Awesome 6.4.0 (CDN)               |
| Images     | Hosted on Bahamut forum CDN (external) |

No npm, no webpack, no TypeScript — open the HTML file in a browser and it works.

---

## Design System

All design tokens are in `assets/css/variables.css`. Always use variables; never hardcode values.

### Colors
```css
--primary-color: #FF79BC;     /* Neon pink — brand color */
--primary-light: #ffb3d9;
--primary-dark:  #ff4da6;
--bg-dark:       #121212;     /* Page background */
--bg-card:       #1e1e1e;     /* Card background */
--bg-card-hover: #2a2a2a;
--text-main:     #ffffff;
--text-muted:    #b0b0b0;
--color-violation: #ff4d4d;   /* Rule violation highlight */
--border-color:  rgba(255, 121, 188, 0.3);
--glow-color:    rgba(255, 121, 188, 0.5);
```

### Typography
- Headings: `var(--font-heading)` → Orbitron (futuristic, uppercase)
- Body: `var(--font-body)` → Noto Sans TC (Traditional Chinese support)
- Base font size: 16px desktop / 14px mobile

### Spacing
```css
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 2rem
--spacing-lg: 3rem
--spacing-xl: 4rem
```

### Breakpoints
| Name   | Value   |
|--------|---------|
| Mobile | < 768px |
| Tablet | 768px–1024px |
| Desktop | > 1024px |

### Transitions
```css
--transition-fast:   0.2s ease
--transition-normal: 0.3s ease
--transition-slow:   0.5s ease
```

---

## JavaScript Architecture

### Pattern: IIFE modules
Every JS module wraps itself in an IIFE with `'use strict'`. Modules are self-initializing — they listen for `DOMContentLoaded` internally. No manual init is needed.

```javascript
(function() {
    'use strict';

    function init() { /* ... */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

### Global CONFIG
`config.js` defines the `CONFIG` object. `main.js` exposes it as `window.CONFIG`. All modules read from `CONFIG`.

```javascript
const CONFIG = {
    serverIP: "bydsmp.com",
    serverName: "BYDSMP",
    discordLink: "https://discord.gg/2EDqgeRKPs",
    email: "bydsmp@gmail.com",
    backgroundImages: [ /* hero BG URLs */ ],
    sliderInterval: 7000,
    copyResetDelay: 3000,
    galleryAutoPlay: true,
    galleryInterval: 5000,
    galleryTransitionDuration: 500,
    galleryPauseOnHover: true
};
```

**Always update `config.js` first** when changing server info, links, or timing values.

### Script load order (index.html)
```html
<script src="assets/js/config.js"></script>           <!-- must be first -->
<script src="assets/js/modules/navigation.js"></script>
<script src="assets/js/modules/galleryCarousel.js"></script>
<script src="assets/js/modules/copyIP.js"></script>
<script src="assets/js/modules/modesScroll.js"></script>
<script src="assets/js/main.js"></script>              <!-- must be last -->
```

`config.js` must load before any module that references `CONFIG`.

---

## Navigation System

The `<nav>` is shared across all pages (copy-pasted, not included). It contains:
- `.nav-center-group` — centered links: 規則 | BYDSMP (brand) | 贊助支持
- `.hamburger` — mobile menu toggle (calls `window.toggleMenu()`)
- `.btn-discord` — Discord button (right side)
- `.nav-links` — mobile dropdown

**Scroll behavior:**
- `index.html`: nav starts hidden (`nav-hidden` class), reveals after 50px scroll
- `rules.html` / `sponsor.html`: nav always visible (detected by URL path in `navigation.js`)

When adding a new sub-page, update the regex in `navigation.js` `initScrollHide()` to keep the nav visible on that page.

---

## Page-specific Notes

### index.html
- Hero `#home`: `.ip-box` button triggers IP copy (handled by `copyIP.js`)
- Toast `#copy-toast` is a fixed overlay — text is set by `copyIP.js`
- Game modes `#modes`: two `<article class="mode-card">` — SMP and KitPVP. `modesScroll.js` adds `is-in-view` class on intersection.
- Gallery `#gallery`: slides are `.gallery-slide` divs in `.gallery-carousel`. First image uses `loading="eager"`, all others use `loading="lazy"`.

### rules.html
- Uses `rulesTabs.js` — tab buttons have `data-tab="tab-xxx"`, panels have matching `id="tab-xxx"`
- URL hash support: `rules.html#tab-pvp` deep-links directly to a tab
- Always forces scroll to top on load (prevents browser scroll restoration)
- Loads only `navigation.js` + `rulesTabs.js` (no config.js needed)

### sponsor.html
- Static content — VIP tier table (`.vip-table`), CTA link, disclaimer
- Loads only `navigation.js`

---

## CSS Conventions

### File organization
- One CSS file per UI component in `assets/css/components/`
- `main.css` imports all component files — add new imports here when creating components
- `variables.css` is imported first by `main.css`

### Naming
- Use descriptive BEM-like class names: `.mode-card`, `.mode-card__content`, `.mode-card--smp`
- State classes: `.active`, `.is-visible`, `.is-in-view`, `.nav-hidden`
- Animation classes (added/removed by JS): `.slide-in-left`, `.slide-out-right`, etc.

### Responsive pattern
Write desktop styles first, then use `@media (max-width: 768px)` for mobile overrides. The base breakpoint is `--breakpoint-mobile: 768px`.

---

## How to Add New Features

### New HTML section
1. Add semantic HTML to the appropriate page with `role`, `aria-*`, and `id` attributes
2. Create `assets/css/components/new-section.css`
3. Add `@import url('./components/new-section.css');` to `assets/css/main.css`
4. If JS is needed, create `assets/js/modules/newFeature.js` using the IIFE pattern
5. Add `<script>` tag to the page's `</body>` (after `config.js` if CONFIG is needed)

### New page
1. Copy the `<head>` block from an existing page — update `<title>`, `<meta description>`, `<link rel="canonical">`, and all OG/Twitter tags
2. Copy the `<nav>` and `<footer>` blocks verbatim
3. Update `navigation.js` `isSubPage` regex to include the new page
4. Add the new URL to `sitemap.xml`

---

## Common Content Updates

| Task | Where to edit |
|------|---------------|
| Server IP or Discord link | `assets/js/config.js` |
| Gallery images | `.gallery-slide` divs in `index.html` `#gallery` |
| Game mode card text | `<article class="mode-card">` in `index.html` `#modes` |
| Server rules | `<ul class="rule-list">` in the relevant panel in `rules.html` |
| VIP sponsorship tiers | `<tbody>` rows in `.vip-table` in `sponsor.html` |
| Hero background | `background-image` in `assets/css/components/hero.css` |
| Global color scheme | `assets/css/variables.css` |
| SEO meta tags | `<head>` of each HTML file |

---

## Local Development

No build step required. Serve the directory with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

Then open `http://localhost:8000`.

**Do not** open HTML files directly as `file://` — relative paths and some browser APIs (Clipboard) require an HTTP origin.

---

## SEO & Accessibility Requirements

Every page must have:
- `<title>` — unique per page
- `<meta name="description">` — 120–160 chars
- `<link rel="canonical">`
- Open Graph (`og:title`, `og:description`, `og:url`, `og:image`, `og:locale`)
- Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`)
- `<meta name="theme-color" content="#FF79BC">`

Accessibility requirements:
- All interactive elements must have `aria-label` or visible text
- Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Images must have meaningful `alt` text (or `alt=""` for decorative)
- Buttons must have `type` attribute
- Tab/panel pairs must use `role="tab"` / `role="tabpanel"` with `aria-selected` / `aria-hidden`
- External links must have `rel="noopener noreferrer"`

---

## Testing Checklist

After any change:

- [ ] IP copy button works and shows toast
- [ ] Gallery carousel auto-plays, prev/next, swipe, keyboard arrows work
- [ ] Nav scroll-hide works on index; nav is always visible on rules/sponsor
- [ ] Hamburger menu opens/closes and closes on link click
- [ ] Rules page tabs switch correctly; URL hash deep-links work
- [ ] Sponsor page table renders correctly
- [ ] Responsive layout at 375px, 768px, 1280px
- [ ] No console errors

---

## Important Notes

- **No frameworks** — no React, Vue, jQuery, or any npm packages
- **No build step** — edit files and refresh the browser
- **No local images for gallery** — all gallery images are hosted on Bahamut forum CDN. Check URLs are still valid periodically.
- **Language** — all user-visible text is Traditional Chinese (zh-TW); code comments may be Chinese or English
- **Unused modules** — `backgroundSlider.js`, `particleBackground.js`, `typewriter.js` exist in `assets/js/modules/` but are not loaded by any page; do not delete without confirming they are truly unused
- **`bydsmp.com.code-workspace`** and `bydsmp.com-main.zip` are editor/backup files — do not modify or commit changes to the zip
