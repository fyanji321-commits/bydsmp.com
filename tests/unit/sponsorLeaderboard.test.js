/**
 * sponsorLeaderboard.js 單元測試
 *
 * 這是專案唯二有外部 I/O 的模組（fetch docs/sponsors.json），全程 mock fetch。
 *
 * 測試面向：
 *   - 無 #sponsor-leaderboard 時安靜退出（index / rules 頁沒有這個區塊）
 *   - 三張統計卡的計算：近期贊助、最高單筆、最高總額（同 id 累計）
 *   - 頭像 URL、金額與日期格式化
 *   - 所有紀錄區塊的插入位置與排序
 *   - fetch 失敗 / 資料格式不合時不應炸掉整頁
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleCode = readFileSync(
  join(__dirname, '../../assets/js/modules/sponsorLeaderboard.js'),
  'utf8'
);
const fixtureHTML = readFileSync(
  join(__dirname, '../fixtures/sponsor-leaderboard.html'),
  'utf8'
);

/**
 * 刻意讓三張卡的贏家互不相同，這樣任何一張卡取錯資料都會被抓到：
 *   近期贊助 → Dawn （日期最新 2026-05-01，但金額最小）
 *   最高單筆 → Blaze（單筆 5000，只贊助過一次）
 *   最高總額 → Ash  （1200 + 4500 + 900 = 6600，靠三筆累計超車 Blaze）
 */
const SPONSORS = [
  { id: 'Ash',   name: 'Ash',   amount: 1200, date: '2026-01-10' },
  { id: 'Blaze', name: 'Blaze', amount: 5000, date: '2026-02-20' },
  { id: 'Ash',   name: 'Ash',   amount: 4500, date: '2026-03-05' },
  { id: 'Ash',   name: 'Ash',   amount: 900,  date: '2026-03-30' },
  { id: 'Dawn',  name: 'Dawn',  amount: 300,  date: '2026-05-01' },
];

const jsonResponse = (body) => ({ ok: true, json: () => Promise.resolve(body) });

function runModule() {
  new Function(moduleCode)();
}

/** 模組用 .then() 串接，讓 microtask queue 清空 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const card = (id) => document.getElementById(id);
const textOf = (root, selector) => root.querySelector(selector).textContent;

describe('sponsorLeaderboard', () => {
  let warnSpy;

  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse({ sponsors: SPONSORS })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 初始化守衛 ────────────────────────────────────────────

  describe('初始化', () => {
    it('頁面沒有 #sponsor-leaderboard 時不應發出請求', async () => {
      document.body.innerHTML = '<div>沒有贊助名單的頁面</div>';
      runModule();
      await flush();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('應向 docs/sponsors.json 取資料', async () => {
      runModule();
      await flush();
      expect(globalThis.fetch).toHaveBeenCalledWith('docs/sponsors.json');
    });

    it('渲染成功後應為 section 加上 is-loaded', async () => {
      runModule();
      await flush();
      expect(document.getElementById('sponsor-leaderboard').classList.contains('is-loaded'))
        .toBe(true);
    });
  });

  // ── 三張統計卡 ────────────────────────────────────────────

  describe('統計卡渲染', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('應渲染三張卡片', () => {
      expect(document.querySelectorAll('#leaderboard-grid .leaderboard-card')).toHaveLength(3);
      expect(card('lb-recent')).not.toBeNull();
      expect(card('lb-top-single')).not.toBeNull();
      expect(card('lb-top-total')).not.toBeNull();
    });

    it('近期贊助應取日期最新的一筆', () => {
      expect(textOf(card('lb-recent'), '.sponsor-player-name')).toBe('Dawn');
      expect(textOf(card('lb-recent'), '.sponsor-player-amount')).toBe('300 TWD');
    });

    it('近期贊助卡應顯示日期，且格式為 YYYY/MM/DD', () => {
      expect(textOf(card('lb-recent'), '.sponsor-player-date')).toBe('2026/05/01');
    });

    it('最高單筆應取金額最大的單一紀錄', () => {
      expect(textOf(card('lb-top-single'), '.sponsor-player-name')).toBe('Blaze');
      expect(textOf(card('lb-top-single'), '.sponsor-player-amount')).toBe('5,000 TWD');
    });

    it('最高單筆卡不應顯示日期', () => {
      expect(card('lb-top-single').querySelector('.sponsor-player-date')).toBeNull();
    });

    it('最高總額應把同一 id 的多筆累加後比較', () => {
      // Ash 累計 1200 + 4500 + 900 = 6600，超過 Blaze 的單筆 5000
      expect(textOf(card('lb-top-total'), '.sponsor-player-name')).toBe('Ash');
      expect(textOf(card('lb-top-total'), '.sponsor-player-amount')).toBe('6,600 TWD');
    });

    it('金額應加上千分位並附上 TWD', () => {
      expect(textOf(card('lb-top-total'), '.sponsor-player-amount')).toMatch(/^[\d,]+ TWD$/);
    });

    it('卡片標題應對應各自的統計語意', () => {
      expect(textOf(card('lb-recent'), '.leaderboard-card__heading')).toBe('近期贊助');
      expect(textOf(card('lb-top-single'), '.leaderboard-card__heading')).toBe('最高單筆贊助');
      expect(textOf(card('lb-top-total'), '.leaderboard-card__heading')).toBe('最高贊助總額');
    });

    it('卡片圖示應引用 icons.svg sprite（不再用 Font Awesome）', () => {
      const iconOf = (id) =>
        card(id).querySelector('.leaderboard-card__header svg.icon use').getAttribute('href');
      expect(iconOf('lb-recent')).toBe('assets/images/icons.svg#i-clock');
      expect(iconOf('lb-top-single')).toBe('assets/images/icons.svg#i-coins');
      expect(iconOf('lb-top-total')).toBe('assets/images/icons.svg#i-trophy');
      expect(card('lb-recent').querySelector('i')).toBeNull();
    });
  });

  // ── 頭像 ─────────────────────────────────────────────────

  describe('玩家頭像', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('應以 id 組出 Minotar 頭像網址', () => {
      const img = card('lb-recent').querySelector('img');
      expect(img.getAttribute('src')).toBe('https://minotar.net/avatar/Dawn/48');
    });

    it('應設定 alt、尺寸與 lazy loading', () => {
      const img = card('lb-recent').querySelector('img');
      expect(img.getAttribute('alt')).toBe('Dawn 的頭像');
      expect(img.width).toBe(48);
      expect(img.height).toBe(48);
      // jsdom 未實作 loading 的屬性反射，因此讀 IDL 屬性而非 getAttribute
      expect(img.loading).toBe('lazy');
    });

    it('頭像載入失敗時應退回 MHF_Steve', () => {
      const img = card('lb-recent').querySelector('img');
      img.onerror();
      expect(img.getAttribute('src')).toBe('https://minotar.net/avatar/MHF_Steve/48');
    });

    it('退回後清掉 onerror，後備圖也失敗時不會無限重試', () => {
      const img = card('lb-recent').querySelector('img');
      img.onerror();
      expect(img.onerror).toBeNull();
    });

    it('id 含特殊字元時應做 URL 編碼', async () => {
      document.body.innerHTML = fixtureHTML;
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(jsonResponse({
          sponsors: [{ id: 'a b/c', name: 'a b/c', amount: 100, date: '2026-01-01' }],
        }))
      );
      runModule();
      await flush();
      expect(card('lb-recent').querySelector('img').getAttribute('src'))
        .toBe('https://minotar.net/avatar/a%20b%2Fc/48');
    });
  });

  // ── 所有紀錄區塊 ──────────────────────────────────────────

  describe('所有紀錄區塊', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('應插在贊助名單 section 之後', () => {
      const section = document.getElementById('sponsor-leaderboard');
      expect(section.nextElementSibling.classList.contains('sponsor-all-records')).toBe(true);
    });

    it('應列出全部紀錄（不合併同一玩家）', () => {
      const rows = document.querySelectorAll('.sponsor-all-records .sponsor-record-row');
      expect(rows).toHaveLength(SPONSORS.length);
    });

    it('應以日期新到舊排序', () => {
      const dates = [...document.querySelectorAll('.sponsor-all-records .sponsor-record-row__date')]
        .map((el) => el.textContent);
      expect(dates).toHaveLength(SPONSORS.length);
      expect(dates).toEqual([...dates].sort().reverse());
      expect(dates[0]).toBe('2026/05/01');
      expect(dates.at(-1)).toBe('2026/01/10');
    });

    it('預設應為收合狀態', () => {
      expect(document.querySelector('.sponsor-all-records details').open).toBe(false);
    });
  });

  // ── 錯誤與異常資料 ────────────────────────────────────────

  describe('錯誤處理', () => {
    const expectNothingRendered = () => {
      expect(document.querySelectorAll('#leaderboard-grid .leaderboard-card')).toHaveLength(0);
      expect(document.getElementById('sponsor-leaderboard').classList.contains('is-loaded'))
        .toBe(false);
    };

    it('HTTP 非 2xx 時不應渲染，且只留下一則警告', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
      runModule();
      await flush();
      expectNothingRendered();
      expect(warnSpy).toHaveBeenCalledWith('[sponsorLeaderboard]', expect.any(Error));
    });

    it('網路錯誤時不應讓例外逸出', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline')));
      runModule();
      await flush();
      expectNothingRendered();
      expect(warnSpy).toHaveBeenCalled();
    });

    it('sponsors 為空陣列時不應渲染空卡片', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse({ sponsors: [] })));
      runModule();
      await flush();
      expectNothingRendered();
    });

    it('sponsors 不是陣列時不應渲染', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse({ sponsors: 'nope' })));
      runModule();
      await flush();
      expectNothingRendered();
    });

    it('JSON 缺少 sponsors 欄位時不應渲染', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse({})));
      runModule();
      await flush();
      expectNothingRendered();
    });
  });

  // ── 真實資料的結構契約 ────────────────────────────────────

  describe('docs/sponsors.json 結構契約', () => {
    const real = JSON.parse(
      readFileSync(join(__dirname, '../../docs/sponsors.json'), 'utf8')
    );

    it('每筆紀錄都應具備模組讀取的四個欄位', () => {
      expect(Array.isArray(real.sponsors)).toBe(true);
      expect(real.sponsors.length).toBeGreaterThan(0);

      for (const s of real.sponsors) {
        expect(typeof s.id).toBe('string');
        expect(s.id.length).toBeGreaterThan(0);
        expect(typeof s.name).toBe('string');
        expect(typeof s.amount).toBe('number');
        expect(Number.isFinite(s.amount)).toBe(true);
        // date 會直接餵給 localeCompare 排序，格式錯了會靜默排錯
        expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('真實資料應能完整渲染出三張卡', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse(real)));
      runModule();
      await flush();
      expect(document.querySelectorAll('#leaderboard-grid .leaderboard-card')).toHaveLength(3);
    });
  });
});
