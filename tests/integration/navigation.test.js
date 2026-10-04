/**
 * navigation.js 整合測試
 * 以 fixtures/navigation.html（與正式頁面相同的 .site-nav 結構）驗證捲動狀態與漢堡選單
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureHTML = readFileSync(join(__dirname, '../fixtures/navigation.html'), 'utf8');
const navigationCode = readFileSync(join(__dirname, '../../assets/js/modules/navigation.js'), 'utf8');

function runNavigation() {
  new Function(navigationCode)();
}

function scrollTo(y) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
  window.dispatchEvent(new Event('scroll'));
}

describe('navigation (integration)', () => {
  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初始化後導覽列可見（沒有 nav-hidden）且頂端時為透明（沒有 is-scrolled）', () => {
    runNavigation();
    const nav = document.querySelector('.site-nav');
    expect(nav.classList.contains('nav-hidden')).toBe(false);
    expect(nav.classList.contains('is-scrolled')).toBe(false);
  });

  it('捲動超過 50px 後加上 is-scrolled，捲回頂端後移除', () => {
    runNavigation();
    const nav = document.querySelector('.site-nav');
    scrollTo(120);
    expect(nav.classList.contains('is-scrolled')).toBe(true);
    scrollTo(0);
    expect(nav.classList.contains('is-scrolled')).toBe(false);
  });

  it('點擊漢堡按鈕後，.nav-links 與 .hamburger 應加上 active', () => {
    runNavigation();
    document.querySelector('.hamburger').click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
    expect(document.querySelector('.hamburger').classList.contains('active')).toBe(true);
  });

  it('再次點擊漢堡按鈕應移除 active（toggle）', () => {
    runNavigation();
    const btn = document.querySelector('.hamburger');
    btn.click();
    btn.click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });

  it('選單開啟時點擊 nav 連結應關閉選單', () => {
    runNavigation();
    document.querySelector('.hamburger').click();
    document.querySelector('.nav-links a').click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });

  it('點擊頁尾連結不應打開或影響主選單', () => {
    runNavigation();
    document.querySelector('footer a').click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });

  it('window.toggleMenu 應作為全域函式匯出並可切換選單', () => {
    runNavigation();
    window.toggleMenu();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
    window.toggleMenu();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });
});
