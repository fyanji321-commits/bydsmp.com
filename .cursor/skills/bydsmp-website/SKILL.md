---
name: bydsmp-website
description: Maintains and updates the BYDSMP Minecraft server website. Use when updating server information, rules, PvP modes, server features, sponsors, or modifying website content and styling.
---

# BYDSMP Website Maintenance

Static multi-page site (HTML + CSS + vanilla JS, no build step). Architecture, conventions and tests are documented in the repo's `CLAUDE.md` and `README.md`; read those first. This file lists the common content updates.

## Common Update Tasks

### Sponsors
Append to `docs/sponsors.json`; details in **`.cursor/skills/bydsmp-website/add-sponsor/SKILL.md`**.

### Server information
Edit `assets/js/config.js` (`serverIP`, `discordLink`, `email`). `main.js` binds these to every `data-config-text` / `data-config-href` / `data-config-mailto` element. Also update the same static default in the HTML so no-JS visitors see it.

### PvP modes, arenas and features (index.html)
- `#pvp`: four `.feature-card` (Duel queue, FFA, Kit editor, party/spectate) + `.mini-card` list.
- `#modes`: three `.mode-group` (Weapons / Vanilla / Skills); `.is-custom` marks modes with a free-form kit. Source of truth: `plugins/pvp/Duel/src/main/resources/modes.yml` in MrPippi/Bydsmp.
- `.arena-list`: arena names from `Duel/arena.yml` (`duel-maps`).
- `#servers`: PvP and SMP `.server-card` bullet lists.

### Rules (rules.html)
Tabs: `tab-basic`, `tab-pvp`, `tab-world`, `tab-redstone`, `tab-violation`. Edit the `<ul class="rule-list">` in each `.rules-panel`; keep the FAQ JSON-LD in `<head>` in sync.

### Navigation / footer
Copied on all three pages; change all three. `npm test` (sharedLayout) fails if they differ.

### Icons
`assets/images/icons.svg` sprite (Lucide, Simple Icons for Discord). Add a `<symbol id="i-name">` copied from lucide-static, then use `<svg class="icon" aria-hidden="true"><use href="assets/images/icons.svg#i-name"></use></svg>`.

### Colors / theme
Tokens in `assets/css/variables.css` (Arena Forge: `--primary-color: #F97316`, `--smp-color: #34D399`).

## Checklist after changes
- `npm test` passes
- Serve with `python -m http.server 8000`; check index, rules (tabs + `#tab-pvp` hash), sponsor (cards render)
- Mobile (< 768px): hamburger menu opens/closes, no horizontal scroll
