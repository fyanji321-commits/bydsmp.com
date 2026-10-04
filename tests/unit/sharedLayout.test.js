/**
 * 跨頁一致性測試：導覽列與頁尾在每頁各複製一份（沒有建置步驟），這裡守住它們不會漂移，
 * 並檢查每頁引用的本機 CSS／JS／圖示都存在、SEO 必要標籤齊全。
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const PAGES = ['index.html', 'rules.html', 'sponsor.html'];
const CURRENT = { 'index.html': null, 'rules.html': '/rules', 'sponsor.html': '/sponsor' };

function parse(page) {
  const doc = new DOMParser().parseFromString(readFileSync(join(root, page), 'utf8'), 'text/html');
  return doc;
}

function normalized(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
  return clone.outerHTML.replace(/\s+/g, ' ').trim();
}

const docs = Object.fromEntries(PAGES.map((p) => [p, parse(p)]));
const iconSprite = readFileSync(join(root, 'assets/images/icons.svg'), 'utf8');

describe('共用版面（導覽列與頁尾）', () => {
  it('每頁的導覽列（忽略 aria-current）應完全相同', () => {
    const [first, ...rest] = PAGES.map((p) => normalized(docs[p].querySelector('.site-nav')));
    rest.forEach((html) => expect(html).toBe(first));
  });

  it('每頁的頁尾應完全相同', () => {
    const [first, ...rest] = PAGES.map((p) => normalized(docs[p].querySelector('.site-footer')));
    rest.forEach((html) => expect(html).toBe(first));
  });

  it.each(PAGES)('%s 的 aria-current 應只標在自己的連結上', (page) => {
    const marked = Array.from(docs[page].querySelectorAll('.site-nav [aria-current="page"]'));
    if (CURRENT[page] === null) {
      expect(marked).toHaveLength(0);
    } else {
      expect(marked.map((a) => a.getAttribute('href'))).toEqual([CURRENT[page]]);
    }
  });
});

describe.each(PAGES)('%s', (page) => {
  const doc = docs[page];

  it('引用的本機 CSS 與 JS 檔案都存在', () => {
    const refs = [
      ...Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.getAttribute('href')),
      ...Array.from(doc.querySelectorAll('script[src]')).map((s) => s.getAttribute('src')),
    ].filter((href) => !/^https?:/.test(href));
    expect(refs.length).toBeGreaterThan(0);
    refs.forEach((href) => expect(existsSync(join(root, href)), href).toBe(true));
  });

  it('config.js 最先、main.js 最後載入', () => {
    const scripts = Array.from(doc.querySelectorAll('script[src]')).map((s) => s.getAttribute('src'));
    expect(scripts[0]).toBe('assets/js/config.js');
    expect(scripts[scripts.length - 1]).toBe('assets/js/main.js');
  });

  it('使用的每個 SVG 圖示都在 icons.svg 裡', () => {
    const ids = Array.from(doc.querySelectorAll('use')).map((u) => u.getAttribute('href').split('#')[1]);
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => expect(iconSprite.includes(`id="${id}"`), id).toBe(true));
  });

  it('不再載入 Font Awesome 或外部相簿圖片', () => {
    const html = doc.documentElement.outerHTML;
    expect(html).not.toMatch(/font-awesome/);
    expect(html).not.toMatch(/bahamut/);
    expect(doc.querySelector('.gallery-carousel')).toBeNull();
  });

  it('具備 SEO 必要標籤', () => {
    expect(doc.querySelector('title').textContent.trim()).not.toBe('');
    expect(doc.querySelector('meta[name="description"]').getAttribute('content')).not.toBe('');
    expect(doc.querySelector('link[rel="canonical"]').getAttribute('href')).toMatch(/^https:\/\/bydsmp\.com\//);
    expect(doc.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(doc.querySelector('meta[name="twitter:card"]')).not.toBeNull();
    expect(doc.querySelector('meta[property^="twitter:"]')).toBeNull();
    expect(doc.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#F97316');
  });

  it('外部連結都帶 rel="noopener noreferrer"', () => {
    doc.querySelectorAll('a[target="_blank"]').forEach((a) => {
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('圖片都有 width、height 與 alt', () => {
    doc.querySelectorAll('img').forEach((img) => {
      expect(img.hasAttribute('width')).toBe(true);
      expect(img.hasAttribute('height')).toBe(true);
      expect(img.hasAttribute('alt')).toBe(true);
    });
  });

  it('頁面只有一個 h1', () => {
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });
});
