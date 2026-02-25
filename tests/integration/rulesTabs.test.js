/**
 * rulesTabs.js 整合測試：在 jsdom 中載入 fixture DOM，執行模組，驗證 tab 切換與 URL hash
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '../fixtures/rules-tabs.html');
const rulesTabsPath = join(__dirname, '../../assets/js/modules/rulesTabs.js');

const fixtureHTML = readFileSync(fixturePath, 'utf8');
const rulesTabsCode = readFileSync(rulesTabsPath, 'utf8');

describe('rulesTabs (integration)', () => {
  let locationMock;
  let replaceStateSpy;

  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    // 不設定 document.readyState（jsdom 為唯讀）；腳本會依現況執行，initRulesTabs 會同步被呼叫

    locationMock = {
      pathname: '/rules.html',
      hash: '',
      href: 'http://localhost/rules.html',
    };
    Object.defineProperty(window, 'location', {
      value: locationMock,
      configurable: true,
      writable: true,
    });

    replaceStateSpy = vi.spyOn(history, 'replaceState').mockImplementation((_state, _title, url) => {
      if (url && typeof url === 'string') {
        const idx = url.indexOf('#');
        locationMock.hash = idx >= 0 ? url.slice(idx) : '';
      }
    });

    window.scrollTo = vi.fn();
  });

  function runRulesTabs() {
    const fn = new Function('document', 'window', 'history', rulesTabsCode);
    fn(document, window, history);
  }

  it('無 hash 時應啟用第一個 tab/panel', () => {
    locationMock.hash = '';
    runRulesTabs();

    const tabBtns = document.querySelectorAll('.rules-tab-btn');
    const panels = document.querySelectorAll('.rules-panel');

    expect(tabBtns[0].classList.contains('active')).toBe(true);
    expect(tabBtns[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].classList.contains('active')).toBe(true);
    expect(panels[0].getAttribute('aria-hidden')).toBe('false');
  });

  it('初始 hash 為 #tab-pvp 時應啟用 PVP tab/panel', () => {
    locationMock.hash = '#tab-pvp';
    runRulesTabs();

    const pvpBtn = document.querySelector('.rules-tab-btn[data-tab="tab-pvp"]');
    const pvpPanel = document.getElementById('tab-pvp');

    expect(pvpBtn?.classList.contains('active')).toBe(true);
    expect(pvpBtn?.getAttribute('aria-selected')).toBe('true');
    expect(pvpPanel?.classList.contains('active')).toBe(true);
    expect(pvpPanel?.getAttribute('aria-hidden')).toBe('false');
  });

  it('點擊 tab 後應切換 active 並更新 URL hash', () => {
    locationMock.hash = '';
    runRulesTabs();

    const worldBtn = document.querySelector('.rules-tab-btn[data-tab="tab-world"]');
    worldBtn?.click();

    const worldPanel = document.getElementById('tab-world');
    expect(worldBtn?.classList.contains('active')).toBe(true);
    expect(worldPanel?.classList.contains('active')).toBe(true);
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', expect.stringContaining('#tab-world'));
  });
});
