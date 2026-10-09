/**
 * leaderboard.js（Duel 排行榜頁）單元測試
 *
 * 全程 mock fetch：依 /api/leaderboard 的 view 參數回 meta / board / find。
 *
 * 測試面向：
 *   - 無 #duel-board 時安靜退出
 *   - 初次渲染：模式分頁、排序按鈕、名次列、前三名標示、更新時間
 *   - 切換模式 / 排序；切到沒有目前排序的天梯退回積分
 *   - 網址參數 ?ladder=&sort= 的讀取與寫回
 *   - 搜尋三種結果與前端格式檢查
 *   - 錯誤狀態與重試、空資料
 *   - 玩家名字以文字呈現（不經 innerHTML）
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleCode = readFileSync(
  join(__dirname, '../../assets/js/modules/leaderboard.js'),
  'utf8'
);
const fixtureHTML = readFileSync(
  join(__dirname, '../fixtures/duel-leaderboard.html'),
  'utf8'
);

const ALL_SORTS = [{ id: 'rating' }, { id: 'wins' }, { id: 'win-rate' }, { id: 'best-streak' }];
const LADDER_SORTS = [{ id: 'rating' }, { id: 'wins' }, { id: 'win-rate' }];

const makeMeta = () => ({
  generatedAt: Date.now() - 30_000,
  minMatches: 10,
  ladders: [
    { id: 'overall', name: '整體', sorts: ALL_SORTS },
    { id: 'nodebuff', name: 'NoDebuff', sorts: LADDER_SORTS },
  ],
});

const makeRow = (rank, name, extra = {}) => ({
  rank, name, rating: 2000 - rank * 10, wins: 50 - rank, losses: rank,
  winRate: 66.7, bestStreak: 7, ...extra,
});

const makeBoard = (ladder, sort) => ({
  generatedAt: Date.now() - 30_000,
  ladder, sort, total: 150,
  rows: [makeRow(1, 'Alpha'), makeRow(2, 'Bravo'), makeRow(3, 'Charlie'), makeRow(4, 'Delta')],
});

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(body),
});

/** 依 view 路由的 fetch mock；個別測試可覆寫 routes 中的某一項 */
let routes;
function installFetch() {
  routes = {
    meta: () => jsonResponse(makeMeta()),
    board: (p) => jsonResponse(makeBoard(p.get('ladder'), p.get('sort'))),
    find: () => jsonResponse({ row: null }),
  };
  globalThis.fetch = vi.fn((url) => {
    const params = new URL(url, 'https://bydsmp.com').searchParams;
    return Promise.resolve(routes[params.get('view')](params));
  });
}

const fetchedViews = () =>
  globalThis.fetch.mock.calls.map(([url]) =>
    Object.fromEntries(new URL(url, 'https://bydsmp.com').searchParams)
  );

function runModule() {
  new Function(moduleCode)();
}

const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const rowNames = () => $$('#duel-list .duel-row__name').map((el) => el.textContent);

async function search(name) {
  $('#duel-search-input').value = name;
  $('#duel-search').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  await flush();
}

describe('leaderboard', () => {
  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    window.history.replaceState(null, '', '/leaderboard');
    installFetch();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始化', () => {
    it('頁面沒有 #duel-board 時不發請求', async () => {
      document.body.innerHTML = '<div>別的頁面</div>';
      runModule();
      await flush();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('先取 meta，再取預設的整體／積分排行', async () => {
      runModule();
      await flush();
      expect(fetchedViews()).toEqual([
        { view: 'meta' },
        { view: 'board', ladder: 'overall', sort: 'rating' },
      ]);
    });
  });

  describe('初次渲染', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('依 meta 畫模式分頁，第一個是整體且被選取', () => {
      const tabs = $$('#duel-ladders [role="tab"]');
      expect(tabs.map((t) => t.textContent)).toEqual(['整體', 'NoDebuff']);
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    });

    it('依天梯的 sorts 畫中文排序按鈕', () => {
      const sorts = $$('#duel-sorts button');
      expect(sorts.map((b) => b.textContent)).toEqual(['積分', '勝場', '勝率', '最佳連勝']);
      expect(sorts[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('照 API 的 rank 畫名次、名字、主數值與勝敗', () => {
      expect(rowNames()).toEqual(['Alpha', 'Bravo', 'Charlie', 'Delta']);
      const first = $('#duel-list .duel-row');
      expect(first.querySelector('.duel-row__rank').textContent).toBe('1');
      expect(first.querySelector('.duel-row__value').textContent).toBe('1990');
      expect(first.querySelector('.duel-row__record').textContent).toBe('勝 49／敗 1');
    });

    it('前三名有品牌色標示，第四名沒有', () => {
      const rows = $$('#duel-list .duel-row');
      expect(rows[0].classList.contains('duel-row--top-1')).toBe(true);
      expect(rows[2].classList.contains('duel-row--top-3')).toBe(true);
      expect(rows[3].className).not.toMatch(/top/);
    });

    it('頭像向 Minotar 取 32px，失敗退回 MHF_Steve', () => {
      const img = $('#duel-list .duel-row__avatar');
      expect(img.src).toBe('https://minotar.net/avatar/Alpha/32');
      expect(img.getAttribute('alt')).toBe('');
      img.dispatchEvent(new Event('error'));
      expect(img.src).toBe('https://minotar.net/avatar/MHF_Steve/32');
    });

    it('說明列顯示更新時間與總人數', () => {
      expect($('#duel-info').textContent).toContain('資料更新於 30 秒前');
      expect($('#duel-info').textContent).toContain('共 150 名');
    });

    it('網址寫回目前的模式與排序', () => {
      expect(window.location.search).toBe('?ladder=overall&sort=rating');
    });
  });

  describe('切換', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('切排序：重抓 board、主數值改顯示勝率、說明列提示場數門檻', async () => {
      $$('#duel-sorts button')[2].click();
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'overall', sort: 'win-rate' });
      expect($('#duel-list .duel-row__value').textContent).toBe('66.7%');
      expect($('#duel-info').textContent).toContain('至少 10 場排隊局');
      expect(window.location.search).toBe('?ladder=overall&sort=win-rate');
    });

    it('切到沒有目前排序的天梯時退回積分', async () => {
      $$('#duel-sorts button')[3].click(); // best-streak
      await flush();
      $$('#duel-ladders [role="tab"]')[1].click(); // nodebuff 沒有 best-streak
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'nodebuff', sort: 'rating' });
      expect($$('#duel-sorts button').map((b) => b.textContent)).toEqual(['積分', '勝場', '勝率']);
    });

    it('切到其他天梯時保留目前排序', async () => {
      $$('#duel-sorts button')[1].click(); // wins
      await flush();
      $$('#duel-ladders [role="tab"]')[1].click();
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'nodebuff', sort: 'wins' });
    });
  });

  describe('網址參數', () => {
    it('讀取 ?ladder=&sort= 作為初始狀態', async () => {
      window.history.replaceState(null, '', '/leaderboard?ladder=nodebuff&sort=wins');
      runModule();
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'nodebuff', sort: 'wins' });
      expect($$('#duel-ladders [role="tab"]')[1].getAttribute('aria-selected')).toBe('true');
    });

    it('不認得的天梯與排序退回預設', async () => {
      window.history.replaceState(null, '', '/leaderboard?ladder=gone&sort=best-streak');
      runModule();
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'overall', sort: 'best-streak' });
    });

    it('天梯不支援網址指定的排序時退回積分', async () => {
      window.history.replaceState(null, '', '/leaderboard?ladder=nodebuff&sort=best-streak');
      runModule();
      await flush();
      expect(fetchedViews().at(-1)).toEqual({ view: 'board', ladder: 'nodebuff', sort: 'rating' });
    });
  });

  describe('搜尋', () => {
    beforeEach(async () => {
      runModule();
      await flush();
    });

    it('格式不符在前端擋下，不發請求', async () => {
      const before = globalThis.fetch.mock.calls.length;
      await search('bad name!');
      expect(globalThis.fetch.mock.calls.length).toBe(before);
      expect($('#duel-search-result').hidden).toBe(false);
      expect($('#duel-search-result').textContent).toContain('英數字與底線');
    });

    it('在前 100 內：捲到那列並高亮', async () => {
      routes.find = () => jsonResponse({ row: makeRow(3, 'Charlie') });
      await search('charlie');
      expect(fetchedViews().at(-1)).toEqual({
        view: 'find', ladder: 'overall', sort: 'rating', name: 'charlie',
      });
      const row = $$('#duel-list .duel-row')[2];
      expect(row.classList.contains('is-highlighted')).toBe(true);
      expect(row.scrollIntoView).toHaveBeenCalled();
      expect($('#duel-pinned').hidden).toBe(true);
    });

    it('不在列表內：在列表下方釘一列', async () => {
      routes.find = () => jsonResponse({ row: makeRow(137, 'Zulu') });
      await search('Zulu');
      const pinned = $('#duel-pinned');
      expect(pinned.hidden).toBe(false);
      expect(pinned.querySelector('.duel-row__rank').textContent).toBe('137');
      expect(pinned.querySelector('.duel-row__name').textContent).toBe('Zulu');
    });

    it('row 為 null：顯示找不到', async () => {
      await search('Nobody');
      expect($('#duel-search-result').textContent).toBe('這個排行裡找不到 Nobody');
      expect($('#duel-pinned').hidden).toBe(true);
    });

    it('切換排序會清除先前的搜尋結果', async () => {
      routes.find = () => jsonResponse({ row: makeRow(137, 'Zulu') });
      await search('Zulu');
      $$('#duel-sorts button')[1].click();
      await flush();
      expect($('#duel-pinned').hidden).toBe(true);
      expect($('#duel-search-result').hidden).toBe(true);
    });
  });

  describe('錯誤與空資料', () => {
    it('meta 失敗顯示錯誤，按重試後恢復', async () => {
      routes.meta = () => jsonResponse({ error: 'x' }, 502);
      runModule();
      await flush();
      expect($('#duel-state').hidden).toBe(false);
      expect($('#duel-state-text').textContent).toBe('排行榜暫時無法取得');
      expect($('#duel-retry').hidden).toBe(false);

      routes.meta = () => jsonResponse(makeMeta());
      $('#duel-retry').click();
      await flush();
      expect($('#duel-state').hidden).toBe(true);
      expect(rowNames()).toHaveLength(4);
    });

    it('board 失敗顯示錯誤，重試只重抓 board', async () => {
      routes.board = () => jsonResponse({ error: 'x' }, 502);
      runModule();
      await flush();
      expect($('#duel-state-text').textContent).toBe('排行榜暫時無法取得');

      routes.board = (p) => jsonResponse(makeBoard(p.get('ladder'), p.get('sort')));
      $('#duel-retry').click();
      await flush();
      expect(fetchedViews().filter((v) => v.view === 'meta')).toHaveLength(1);
      expect(rowNames()).toHaveLength(4);
    });

    it('沒有天梯時顯示空狀態、不顯示重試', async () => {
      routes.meta = () => jsonResponse({ ...makeMeta(), ladders: [] });
      runModule();
      await flush();
      expect($('#duel-state-text').textContent).toBe('目前沒有排行資料');
      expect($('#duel-retry').hidden).toBe(true);
    });

    it('board 沒有任何列時顯示空狀態', async () => {
      routes.board = (p) => jsonResponse({ ...makeBoard(p.get('ladder'), p.get('sort')), rows: [], total: 0 });
      runModule();
      await flush();
      expect($('#duel-state-text').textContent).toBe('目前沒有排行資料');
    });
  });

  describe('安全性', () => {
    it('玩家名字以純文字呈現', async () => {
      routes.board = (p) => jsonResponse({
        ...makeBoard(p.get('ladder'), p.get('sort')),
        rows: [makeRow(1, '<img src=x onerror=alert(1)>')],
      });
      runModule();
      await flush();
      expect($('#duel-list img[src="x"]')).toBeNull();
      expect(rowNames()[0]).toBe('<img src=x onerror=alert(1)>');
    });
  });
});
