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

### CSS: Token-driven, linked per page

`variables.css` holds every design token (colors, fonts, spacing, `--clip-cut-*` angled corners); never hardcode values elsewhere. There is no `@import` chain: each page `<link>`s what it needs in order `variables.css` → `base.css` → `components/navigation.css` → page component (`home.css` / `rules.css` / `sponsor.css`) → `components/footer.css`.

**Current theme: "Arena Forge"** — ember orange (`#F97316`, brand + PvP) with emerald (`--smp-color`) for SMP, Rajdhani headings + Noto Sans TC body + JetBrains Mono labels, dark background (`#08080E`). Icons are an SVG sprite at `assets/images/icons.svg` used as `<svg class="icon"><use href="assets/images/icons.svg#i-name"></use></svg>`; no icon font.

### JavaScript: Self-initializing IIFE modules

Every JS module is an IIFE with `'use strict'` that listens for `DOMContentLoaded` internally. No manual init, no exports, no bundler.

```
config.js (must load first) → navigation.js → [page modules] → main.js (must load last)
```

`config.js` defines the global `CONFIG` (server IP, Discord link, email, toast delay). `main.js` binds it to markup: `data-config-text="key"` sets text, `data-config-href="key"` sets href, `data-config-mailto="key"` sets text + mailto. The HTML carries the same values as static defaults so pages work without JS.

### Pages and their scripts

| Page | Scripts loaded | Notes |
|------|---------------|-------|
| `index.html` | config, navigation, copyIP, reveal, serverStatus, main | PvP-first landing page |
| `rules.html` | config, navigation, rulesTabs, main | Tabs: basic, pvp, world, redstone, violation |
| `sponsor.html` | config, navigation, sponsorLeaderboard, main | Reads `docs/sponsors.json` |

Home page content (PvP systems, mode list, arenas, SMP features) mirrors plugins in `MrPippi/Bydsmp` (`plugins/pvp/*`, `plugins/smp/*`). Mode names come from `Duel/modes.yml`, arena names from `Duel/arena.yml`.

### Navigation and footer

Nav and footer HTML are **copy-pasted** across all 3 pages; `tests/unit/sharedLayout.test.js` fails if they drift (only `aria-current="page"` may differ). The nav is always visible: transparent at the top, `.is-scrolled` (added by `navigation.js` past 50px) makes it solid. Elements fade in on scroll via `data-reveal` (`reveal.js`); content stays visible without JS (`html.js` gate) and with `prefers-reduced-motion`.

**When adding a new sub-page:** copy the nav/footer from an existing page, use `<main class="subpage" id="main">`, add it to `vercel.json` rewrites and `sitemap.xml`, and add it to `PAGES` in `sharedLayout.test.js`.

### Sponsor system

Sponsor data lives in `docs/sponsors.json`. `sponsorLeaderboard.js` fetches it at page load and renders 3 stat cards (recent, highest single, highest total). To add a sponsor, append to the `sponsors` array:

```json
{ "id": "MinecraftID", "name": "MinecraftID", "amount": 400, "date": "YYYY-MM-DD" }
```

`id` is case-sensitive (used for Minotar avatar URL). Same `id` with multiple entries = cumulative total calculated automatically.

## Testing architecture

Tests use Vitest + jsdom. Since IIFE modules have no exports, tests load them via `fs.readFileSync()` + `new Function(code)()` which executes the IIFE inside jsdom's `globalThis` scope. `CONFIG`, `document`, `navigator`, `window` all resolve from jsdom automatically.

Key gotchas:
- Use `vi.useFakeTimers()` for copyIP toast timer tests; reveal tests stub `IntersectionObserver` and `matchMedia`
- Test structure: `tests/unit/` + `tests/integration/` + `tests/fixtures/` (HTML fixtures loaded per test)

## SEO requirements

Every page must have: unique `<title>`, `<meta name="description">` (120-160 chars), `<link rel="canonical">`, Open Graph tags, Twitter Card tags, `<meta name="theme-color" content="#F97316">`.

## Key conventions

- CSS variables from `variables.css` only — no hardcoded colors/spacing
- Desktop-first responsive: base styles then `@media (max-width: 768px)` overrides
- BEM-like class names: `.server-card`, `.server-card__body`, `.server-card--smp`
- State classes managed by JS: `.active`, `.is-open`, `.is-scrolled`, `.is-visible`
- Images: `loading="lazy"` on all except first visible, must have `width`/`height`/`alt`
- External links: `rel="noopener noreferrer"`
- All images are local under `assets/images/` (the old Bahamut-hosted gallery was removed)
