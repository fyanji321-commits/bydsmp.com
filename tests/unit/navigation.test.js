/**
 * navigation.js 單元測試
 * 測試：
 *   - 首頁 nav-hidden 初始行為 vs 子頁面（rules / sponsor）永遠顯示
 *   - 捲動超過/低於閾值時的 nav-hidden 切換
 *   - 漢堡選單的開關與點擊外部關閉
 *   - window.toggleMenu 全域匯出
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const navCode = readFileSync(
  join(__dirname, '../../assets/js/modules/navigation.js'),
  'utf8'
);

const NAV_HTML = `
  <nav role="navigation" aria-label="主要導航">
    <div class="nav-center-group">
      <a href="rules.html" class="nav-center-link">規則</a>
      <a href="index.html" class="brand-link brand-text">BYDSMP</a>
      <a href="sponsor.html" class="nav-center-link">贊助支持</a>
    </div>
    <button class="hamburger" aria-expanded="false" aria-controls="nav-links">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links">
      <a href="rules.html">規則</a>
      <a href="sponsor.html">贊助支持</a>
    </div>
  </nav>
`;

function runNavigation() {
  new Function(navCode)();
}

describe('navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = NAV_HTML;
    // 確保 scrollY 從 0 開始
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // 重置 URL 避免影響其他測試
    window.history.pushState({}, '', '/');
  });

  // ── 捲動隱藏行為 ─────────────────────────────────────────────────────────

  describe('捲動隱藏 (Scroll Hide)', () => {
    it('路徑為 / 時應初始加上 nav-hidden（首頁預設隱藏）', () => {
      window.history.pushState({}, '', '/');
      runNavigation();
      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(true);
    });

    it('路徑為 /index.html 時應初始加上 nav-hidden', () => {
      window.history.pushState({}, '', '/index.html');
      runNavigation();
      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(true);
    });

    it('路徑為 /rules.html 時不應加上 nav-hidden', () => {
      window.history.pushState({}, '', '/rules.html');
      runNavigation();
      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(false);
    });

    it('路徑為 /sponsor.html 時不應加上 nav-hidden', () => {
      window.history.pushState({}, '', '/sponsor.html');
      runNavigation();
      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(false);
    });

    it('捲動超過 50px 應移除 nav-hidden', () => {
      window.history.pushState({}, '', '/');
      runNavigation();
      const nav = document.querySelector('nav');
      expect(nav.classList.contains('nav-hidden')).toBe(true);

      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(nav.classList.contains('nav-hidden')).toBe(false);
    });

    it('捲動回 50px 以下應重新加上 nav-hidden', () => {
      window.history.pushState({}, '', '/');
      runNavigation();

      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(true);
    });

    it('剛好在閾值 50px 時不應移除 nav-hidden', () => {
      window.history.pushState({}, '', '/');
      runNavigation();

      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(document.querySelector('nav').classList.contains('nav-hidden')).toBe(true);
    });
  });

  // ── 漢堡選單 ─────────────────────────────────────────────────────────────

  describe('漢堡選單 (Hamburger Menu)', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/');
      runNavigation();
    });

    it('點擊漢堡按鈕應開啟選單（加上 active）', () => {
      document.querySelector('.hamburger').click();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
      expect(document.querySelector('.hamburger').classList.contains('active')).toBe(true);
    });

    it('再次點擊漢堡按鈕應關閉選單（移除 active）', () => {
      const hamburger = document.querySelector('.hamburger');
      hamburger.click();
      hamburger.click();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
    });

    it('選單開啟時點擊外部區域應關閉選單', () => {
      document.querySelector('.hamburger').click();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);

      // 點擊 document（非 nav 內部）
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
    });

    it('選單開啟時點擊選單內連結應關閉選單', () => {
      document.querySelector('.hamburger').click();
      // 點擊 nav-links 內的連結
      document.querySelector('.nav-links a').click();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
    });
  });

  // ── window.toggleMenu 匯出 ────────────────────────────────────────────────

  describe('window.toggleMenu 全域匯出', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/');
      runNavigation();
    });

    it('應將 toggleMenu 掛載到 window', () => {
      expect(typeof window.toggleMenu).toBe('function');
    });

    it('呼叫 window.toggleMenu() 應開啟選單', () => {
      window.toggleMenu();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(true);
    });

    it('呼叫兩次 window.toggleMenu() 應關閉選單', () => {
      window.toggleMenu();
      window.toggleMenu();
      expect(document.querySelector('.nav-links').classList.contains('active')).toBe(false);
    });
  });
});
