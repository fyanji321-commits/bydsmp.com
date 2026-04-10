# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Official website for the BYDSMP Taiwan Minecraft server (`bydsmp.com`). A multi-page static website with no build step, no frameworks — plain HTML5, CSS3, and Vanilla JavaScript. All user-visible text is Traditional Chinese (`zh-TW`).

## Commands

```bash
# Local development (requires HTTP server — file:// breaks Clipboard API and relative paths)
python -m http.server 8000

# Testing (Vitest + jsdom)
npm test                                    # Run all tests once
npm run test:watch                          # Watch mode
npm run test:coverage                       # V8 coverage report
npx vitest run tests/unit/copyIP.test.js    # Single test file
```

## Architecture

### CSS: Token-driven component system

`main.css` imports `variables.css` (design tokens) then component files. All colors, spacing, fonts, and shadows are CSS custom properties — never hardcode values.

```
variables.css → main.css imports → effects.css, navigation.css, hero.css, sections.css,
                                    gallery.css, footer.css, rules.css, sponsor.css, serverStatus.css
```

**Current theme: "Obsidian Forge"** — ember orange (`#F97316`) + steel blue-gray (`#94A3B8`), Rajdhani headings + Noto Sans TC body + JetBrains Mono monospace. Dark background (`#08080E`).

### JavaScript: Self-initializing IIFE modules

Every JS module is an IIFE with `'use strict'` that listens for `DOMContentLoaded` internally. No manual init, no exports, no bundler.

```
config.js (must load first) → navigation.js → [page modules] → main.js (must load last)
```

`config.js` defines the global `CONFIG` object (server IP, Discord link, email, timing values). `main.js` exposes it as `window.CONFIG` and injects values into footer/nav DOM elements.

### Pages and their scripts

| Page | Scripts loaded | Notes |
|------|---------------|-------|
| `index.html` | config, navigation, galleryCarousel, copyIP, modesScroll, serverStatus, main | Full feature set |
| `rules.html` | navigation, rulesTabs | No config.js needed |
| `sponsor.html` | config, navigation, sponsorLeaderboard, main | Reads `docs/sponsors.json` |

### Navigation behavior

Nav HTML is **copy-pasted** across all 3 pages (not shared/included). On `index.html`, nav starts hidden and reveals after 50px scroll. On sub-pages (`rules.html`, `sponsor.html`), nav is always visible — controlled by `data-nav="always-visible"` attribute on `<nav>`.

**When adding a new sub-page:** add `data-nav="always-visible"` to its `<nav>` element and update `sitemap.xml`.

### Sponsor system

Sponsor data lives in `docs/sponsors.json`. `sponsorLeaderboard.js` fetches it at page load and renders 3 stat cards (recent, highest single, highest total). To add a sponsor, append to the `sponsors` array:

```json
{ "id": "MinecraftID", "name": "MinecraftID", "amount": 400, "date": "YYYY-MM-DD" }
```

`id` is case-sensitive (used for Minotar avatar URL). Same `id` with multiple entries = cumulative total calculated automatically.

## Testing architecture

Tests use Vitest + jsdom. Since IIFE modules have no exports, tests load them via `fs.readFileSync()` + `new Function(code)()` which executes the IIFE inside jsdom's `globalThis` scope. `CONFIG`, `document`, `navigator`, `window` all resolve from jsdom automatically.

Key gotchas:
- Use `vi.useFakeTimers()` for carousel/modesScroll/copyIP timer tests
- Set `galleryTransitionDuration: 100` in test CONFIG (never 0 — the code uses `0 || 500` fallback)
- Mock touch events as `new Event(type)` with `event.changedTouches = [{screenX}]` (jsdom lacks `TouchEvent`)
- Test structure: `tests/unit/` + `tests/integration/` + `tests/fixtures/` (HTML fixtures loaded per test)

## SEO requirements

Every page must have: unique `<title>`, `<meta name="description">` (120-160 chars), `<link rel="canonical">`, Open Graph tags, Twitter Card tags, `<meta name="theme-color" content="#F97316">`.

## Key conventions

- CSS variables from `variables.css` only — no hardcoded colors/spacing
- Desktop-first responsive: base styles then `@media (max-width: 768px)` overrides
- BEM-like class names: `.mode-card`, `.mode-card__content`, `.mode-card--smp`
- State classes managed by JS: `.active`, `.is-visible`, `.is-in-view`, `.nav-hidden`
- Images: `loading="lazy"` on all except first visible, must have `width`/`height`/`alt`
- External links: `rel="noopener noreferrer"`
- Gallery images are hosted on Bahamut forum CDN (external URLs, not local)
- Unused legacy modules exist (`backgroundSlider.js`, `particleBackground.js`, `typewriter.js`) — not loaded by any page
