/**
 * navigation.js 整合測試
 * 驗證：首頁捲動隱藏/顯示 nav、子頁面 nav 永遠可見、漢堡選單開關
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '../fixtures/navigation.html');
const modulePath = join(__dirname, '../../assets/js/modules/navigation.js');

const fixtureHTML = readFileSync(fixturePath, 'utf8');
const navigationCode = readFileSync(modulePath, 'utf8');

/**
 * 以指定 pathname 執行 navigation 模組。
 * 每次呼叫都在同一個 jsdom window 上添加監聽器，
 * 但 nav 是從最新 DOM 取得，所以不影響測試正確性。
 */
function runNavigation(pathname = '/') {
  const mockLocation = { pathname, hash: '' };
  const mockWindow = new Proxy(window, {
    get(target, prop) {
      if (prop === 'location') return mockLocation;
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    },
  });
  const fn = new Function('document', 'window', 'history', navigationCode);
  fn(document, mockWindow, history);
}

describe('navigation (integration)', () => {
  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 捲動隱藏行為 ─────────────────────────────────────────────

  it('首頁（/）: 初始化後 nav 應有 nav-hidden', () => {
    runNavigation('/');
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('nav-hidden')).toBe(true);
  });

  it('首頁：捲動超過 50px 後應移除 nav-hidden', () => {
    runNavigation('/');
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('nav-hidden')).toBe(false);
  });

  it('首頁：捲回 50px 以內後應還原 nav-hidden', () => {
    runNavigation('/');
    // 先捲到 100 讓 nav 顯示
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    // 再捲回頂部
    Object.defineProperty(window, 'scrollY', { value: 10, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('nav-hidden')).toBe(true);
  });

  it('rules.html: 初始化後 nav 不應有 nav-hidden', () => {
    runNavigation('/rules.html');
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('nav-hidden')).toBe(false);
  });

  it('sponsor.html: 初始化後 nav 不應有 nav-hidden', () => {
    runNavigation('/sponsor.html');
    const nav = document.querySelector('nav');
    expect(nav.classList.contains('nav-hidden')).toBe(false);
  });

  // ── 漢堡選單 ────────────────────────────────────────────────

  it('點擊漢堡按鈕後，.nav-links 與 .hamburger 應加上 active', () => {
    runNavigation('/');
    document.querySelector('.hamburger').click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
    expect(document.querySelector('.hamburger').classList.contains('active')).toBe(true);
  });

  it('再次點擊漢堡按鈕應移除 active（toggle）', () => {
    runNavigation('/');
    const hamburger = document.querySelector('.hamburger');
    hamburger.click();
    hamburger.click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });

  it('選單開啟時點擊 nav 連結應關閉選單', () => {
    runNavigation('/');
    document.querySelector('.hamburger').click();
    // 點擊選單內第一個連結
    document.querySelector('.nav-links a').click();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });

  it('window.toggleMenu 應作為全域函式匯出並可切換選單', () => {
    runNavigation('/');
    expect(typeof window.toggleMenu).toBe('function');
    window.toggleMenu();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
    window.toggleMenu();
    expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
  });
});
