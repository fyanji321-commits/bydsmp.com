---
name: bydsmp-website
description: Maintains and updates the BYDSMP Minecraft server website. Use when updating server information, rules, gallery images, game modes, or modifying website content and styling.
---

# BYDSMP Website Maintenance

## Project Overview

This is a modular single-page HTML website for the BYDSMP Minecraft server. The project uses a modern architecture with separated CSS and JavaScript modules.

## File Structure

```
bydsmp.com/
├── index.html                      # Main HTML file
├── assets/
│   ├── css/
│   │   ├── main.css               # Main stylesheet (imports all)
│   │   ├── variables.css          # CSS variables
│   │   └── components/            # Component styles
│   │       ├── navigation.css
│   │       ├── hero.css
│   │       ├── sections.css
│   │       ├── gallery.css
│   │       └── footer.css
│   ├── js/
│   │   ├── main.js                # Main entry point
│   │   ├── config.js              # Configuration file
│   │   └── modules/               # JavaScript modules
│   │       ├── navigation.js
│   │       ├── copyIP.js
│   │       └── backgroundSlider.js
│   └── images/                    # Local images (if needed)
└── .cursor/skills/bydsmp-website/  # This skill directory
```

## Key Sections

The website contains these main sections (identified by `id` attributes):

1. **#home** - Hero section with server IP and title
2. **#modes** - Game modes (SMP and KitPVP)
3. **#gallery** - Server screenshot gallery
4. **#rules** - Server rules (basic, world, redstone, PVP, violations)
5. **#sponsor** - Sponsorship information

## Common Update Tasks

### Updating Server Information

**Recommended**: Update `assets/js/config.js` - all server info is centralized here:
- `serverIP`: Server IP address
- `discordLink`: Discord invite link
- `email`: Contact email

The config is used throughout the site, so updating it here will update all references.

**Manual updates** (if needed):
- Hero section `.ip-box` element in `index.html`
- Footer in `index.html`

### Updating Gallery Images

Gallery images are in `#gallery` section of `index.html` (around line ~200). Each image is in a `.gallery-item` div:

```html
<div class="gallery-item" role="listitem">
    <img src="圖片網址" 
         alt="伺服器圖片 X" 
         loading="lazy"
         width="250"
         height="200">
</div>
```

To add/remove images:
- Add new `.gallery-item` divs before the closing `</div>` of `.gallery-grid`
- Update alt text for accessibility
- Ensure images are hosted externally (currently using Bahamut forum links)
- Always include `loading="lazy"` for performance

### Updating Rules

Rules are organized in `.rule-box` elements within `#rules` section of `index.html`. Each rule category has its own `<article>` box:

- Basic rules (基本規則)
- World rules (世界規則)
- Redstone rules (生電規則)
- PVP rules (PVP 規則)
- Violations (違規處理)

Update the `<ul class="rule-list">` content within each box.

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

### Updating Background Images

Hero section background images are defined in `assets/js/config.js`:

```javascript
backgroundImages: [
    '圖片網址 1',
    '圖片網址 2'
],
```

Change interval timing in `config.js`:
```javascript
sliderInterval: 7000, // milliseconds
```

### Updating Navigation Links

Navigation links are in `<nav>` element of `index.html`. Update:
- Link text
- Anchor targets (`href="#section-id"`)
- Discord link URL (preferably in `config.js`)

### Updating Meta Tags

SEO meta tags are in `<head>` section of `index.html`:
- `description`: Page description
- `keywords`: SEO keywords
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags

Update these when changing site content or adding new features.

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
- [ ] Test IP copy functionality
- [ ] Verify all images load correctly
- [ ] Check responsive design on mobile (< 768px)
- [ ] Test navigation menu (especially hamburger menu)
- [ ] Verify background image rotation works
- [ ] Check all anchor links scroll correctly
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
3. Add `<script>` tag to `index.html` before closing `</body>`
4. Module will auto-initialize on DOM ready

### Modifying Styles

- **Global changes**: Edit `assets/css/variables.css`
- **Component changes**: Edit corresponding file in `assets/css/components/`
- **New component**: Create new file and import in `main.css`
