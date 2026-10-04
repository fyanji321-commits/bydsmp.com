/**
 * navigation.js 單元測試
 * 測試：
 *   - 導覽列永遠可見；捲動超過 50px 加 .is-scrolled，回到頂端移除
 *   - 只作用在 .site-nav（頁尾的 <nav> 不受影響）
 *   - 漢堡選單的開關、aria 狀態、點擊外部與 Esc 關閉
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
  <nav class="site-nav" aria-label="主要導航">
    <a href="/" class="brand-link">BYDSMP</a>
    <div class="nav-links" id="nav-links">
      <a href="/rules">規則</a>
      <a href="/sponsor">贊助</a>
    </div>
    <button class="hamburger" aria-label="開啟選單" aria-expanded="false" aria-controls="nav-links">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <footer><nav aria-label="頁尾連結"><a href="/rules">規則</a></nav></footer>
`;

function runNavigation() {
  new Function(navCode)();
}

function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', { value, configurable: true });
}

const siteNav = () => document.querySelector('.site-nav');
const navLinks = () => document.querySelector('.nav-links');
const hamburger = () => document.querySelector('.hamburger');

describe('navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = NAV_HTML;
    setScrollY(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('捲動狀態 (is-scrolled)', () => {
    it('頁面頂端時不應有 is-scrolled，也不應隱藏導覽列', () => {
      runNavigation();
      expect(siteNav().classList.contains('is-scrolled')).toBe(false);
      expect(siteNav().classList.contains('nav-hidden')).toBe(false);
    });

    it('載入時已捲動超過 50px（例如重新整理）應立即加上 is-scrolled', () => {
      setScrollY(300);
      runNavigation();
      expect(siteNav().classList.contains('is-scrolled')).toBe(true);
    });

    it('捲動超過 50px 應加上 is-scrolled', () => {
      runNavigation();
      setScrollY(100);
      window.dispatchEvent(new Event('scroll'));
      expect(siteNav().classList.contains('is-scrolled')).toBe(true);
    });

    it('捲回 50px 以內應移除 is-scrolled', () => {
      runNavigation();
      setScrollY(100);
      window.dispatchEvent(new Event('scroll'));
      setScrollY(10);
      window.dispatchEvent(new Event('scroll'));
      expect(siteNav().classList.contains('is-scrolled')).toBe(false);
    });

    it('剛好在閾值 50px 時不應加上 is-scrolled', () => {
      runNavigation();
      setScrollY(50);
      window.dispatchEvent(new Event('scroll'));
      expect(siteNav().classList.contains('is-scrolled')).toBe(false);
    });

    it('頁尾的 <nav> 不應被加上任何狀態 class', () => {
      setScrollY(300);
      runNavigation();
      expect(document.querySelector('footer nav').className).toBe('');
    });

    it('頁面沒有 .site-nav 時不應拋錯', () => {
      document.body.innerHTML = '<nav></nav>';
      expect(() => runNavigation()).not.toThrow();
    });
  });

  describe('漢堡選單 (Hamburger Menu)', () => {
    beforeEach(() => {
      runNavigation();
    });

    it('點擊漢堡按鈕應開啟選單並更新 aria', () => {
      hamburger().click();
      expect(navLinks().classList.contains('active')).toBe(true);
      expect(hamburger().classList.contains('active')).toBe(true);
      expect(siteNav().classList.contains('is-open')).toBe(true);
      expect(hamburger().getAttribute('aria-expanded')).toBe('true');
      expect(hamburger().getAttribute('aria-label')).toBe('關閉選單');
    });

    it('再次點擊漢堡按鈕應關閉選單', () => {
      hamburger().click();
      hamburger().click();
      expect(navLinks().classList.contains('active')).toBe(false);
      expect(siteNav().classList.contains('is-open')).toBe(false);
      expect(hamburger().getAttribute('aria-expanded')).toBe('false');
      expect(hamburger().getAttribute('aria-label')).toBe('開啟選單');
    });

    it('選單開啟時點擊外部區域應關閉選單', () => {
      hamburger().click();
      document.body.click();
      expect(navLinks().classList.contains('active')).toBe(false);
    });

    it('選單開啟時點擊選單內連結應關閉選單', () => {
      hamburger().click();
      navLinks().querySelector('a').click();
      expect(navLinks().classList.contains('active')).toBe(false);
    });

    it('選單開啟時按 Esc 應關閉選單並把焦點還給漢堡按鈕', () => {
      hamburger().click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(navLinks().classList.contains('active')).toBe(false);
      expect(document.activeElement).toBe(hamburger());
    });

    it('選單關閉時按 Esc 不應改變狀態', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(navLinks().classList.contains('active')).toBe(false);
      expect(hamburger().getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('window.toggleMenu 全域匯出', () => {
    beforeEach(() => {
      runNavigation();
    });

    it('應將 toggleMenu 掛載到 window', () => {
      expect(typeof window.toggleMenu).toBe('function');
    });

    it('呼叫 window.toggleMenu() 應開啟選單', () => {
      window.toggleMenu();
      expect(navLinks().classList.contains('active')).toBe(true);
    });

    it('呼叫兩次 window.toggleMenu() 應關閉選單', () => {
      window.toggleMenu();
      window.toggleMenu();
      expect(navLinks().classList.contains('active')).toBe(false);
    });
  });
});
