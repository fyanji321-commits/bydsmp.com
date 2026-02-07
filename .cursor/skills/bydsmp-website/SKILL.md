---
name: bydsmp-website
description: Maintains and updates the BYDSMP Minecraft server website. Use when updating server information, rules, gallery images, game modes, or modifying website content and styling.
---

# BYDSMP Website Maintenance

## Project Overview

This is a single-page HTML website for the BYDSMP Minecraft server. All HTML, CSS, and JavaScript are contained in `index.html`.

## File Structure

- `index.html` - Main website file containing all code
- `.cursor/skills/bydsmp-website/` - This skill directory

## Key Sections

The website contains these main sections (identified by `id` attributes):

1. **#home** - Hero section with server IP and title
2. **#modes** - Game modes (SMP and KitPVP)
3. **#gallery** - Server screenshot gallery
4. **#rules** - Server rules (basic, world, redstone, PVP, violations)
5. **#sponsor** - Sponsorship information

## Common Update Tasks

### Updating Server IP

Find the IP in two places:
1. Hero section `.ip-box` element (line ~481)
2. `copyIP()` function (line ~672)
3. Footer (line ~651)

### Updating Gallery Images

Gallery images are in `#gallery` section (lines ~517-565). Each image is in a `.gallery-item` div:

```html
<div class="gallery-item">
    <img src="圖片網址" alt="伺服器圖片 X">
</div>
```

To add/remove images:
- Add new `.gallery-item` divs before the closing `</div>` of `.gallery-grid`
- Update alt text for accessibility
- Ensure images are hosted externally (currently using Bahamut forum links)

### Updating Rules

Rules are organized in `.rule-box` elements within `#rules` section (lines ~569-623). Each rule category has its own box:

- Basic rules (基本規則)
- World rules (世界規則)
- Redstone rules (生電規則)
- PVP rules (PVP 規則)
- Violations (違規處理)

Update the `<ul class="rule-list">` content within each box.

### Updating Game Modes

Game mode cards are in `#modes` section (lines ~488-514). Each mode has a `.mode-card` with:
- `<h3>` title
- `<ul>` list of features

### Updating Colors/Theme

CSS variables are defined in `:root` (lines ~12-20):

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

Modify these to change the color scheme.

### Updating Background Images

Hero section background images are defined in JavaScript (lines ~693-696):

```javascript
const bgImages = [
    '圖片網址 1',
    '圖片網址 2'
];
```

Change interval timing in `setInterval` (line ~710, default 7000ms = 7 seconds).

### Updating Navigation Links

Navigation links are in `<nav>` element (lines ~457-474). Update:
- Link text
- Anchor targets (`href="#section-id"`)
- Discord link URL

## Design Guidelines

- **Color Scheme**: Pink neon theme (#FF79BC primary)
- **Fonts**: 
  - Orbitron for headings (futuristic)
  - Noto Sans TC for body text (Chinese support)
- **Responsive**: Mobile-first design with hamburger menu for < 768px
- **Animations**: Smooth transitions (0.3s default), neon glow effects

## Code Style

- Inline CSS in `<style>` tag (lines ~11-452)
- Inline JavaScript in `<script>` tag (lines ~656-712)
- Semantic HTML5 structure
- Traditional Chinese (zh-TW) language

## Testing Checklist

After making changes:
- [ ] Test IP copy functionality
- [ ] Verify all images load correctly
- [ ] Check responsive design on mobile (< 768px)
- [ ] Test navigation menu (especially hamburger menu)
- [ ] Verify background image rotation works
- [ ] Check all anchor links scroll correctly
- [ ] Validate HTML structure

## Important Notes

- All images are hosted externally (Bahamut forum)
- No build process required - edit `index.html` directly
- Website uses vanilla JavaScript (no frameworks)
- Discord link: https://discord.gg/2EDqgeRKPs
- Contact email: bydsmp@gmail.com

## Maintenance Tips

1. **Image Links**: Regularly check that external image URLs are still valid
2. **Rules Updates**: Keep rules synchronized with actual server rules
3. **Gallery**: Add new screenshots periodically to showcase server
4. **Performance**: Consider image optimization if loading becomes slow
5. **Accessibility**: Ensure alt text is descriptive for all images
