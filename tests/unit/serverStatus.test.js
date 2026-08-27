/**
 * serverStatus.js 單元測試
 *
 * 這是專案唯二有外部 I/O 的模組（打 api.mcsrvstat.us），全程 mock fetch，
 * 測試不碰真實網路。
 *
 * 測試面向：
 *   - 無 widget 時安靜退出（rules / sponsor 頁沒有這個元素）
 *   - loading / online / offline / error 四種狀態的 DOM 呈現
 *   - 假最大人數過濾（rawMax > 500 視為裝飾數字）
 *   - 60 秒輪詢與 visibilitychange 暫停/恢復
 *   - 逾時中止（AbortController）
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const moduleCode = readFileSync(
  join(__dirname, '../../assets/js/modules/serverStatus.js'),
  'utf8'
);
const fixtureHTML = readFileSync(
  join(__dirname, '../fixtures/server-status.html'),
  'utf8'
);

const POLL_MS = 60_000;

/** 組出 mcsrvstat.us v3 的回應形狀 */
const apiResponse = (body) => ({
  ok: true,
  json: () => Promise.resolve(body),
});

function runModule() {
  new Function(moduleCode)();
}

/** 讓模組內以 await 串接的 then 有機會跑完 */
const flush = () => vi.advanceTimersByTimeAsync(0);

const el = (id) => document.getElementById(id);

/** document.hidden 是唯讀的，只能改描述子 */
const setHidden = (value) =>
  Object.defineProperty(document, 'hidden', { value, configurable: true });

describe('serverStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = fixtureHTML;
    globalThis.CONFIG = { serverIP: 'bydsmp.com' };
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(apiResponse({ online: true, players: { online: 7, max: 100 } }))
    );
  });

  afterEach(() => {
    setHidden(false);
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete globalThis.CONFIG;
  });

  // ── 初始化守衛 ────────────────────────────────────────────

  describe('初始化', () => {
    it('頁面沒有 #server-status-widget 時不應發出請求', async () => {
      document.body.innerHTML = '<div>沒有狀態小工具的頁面</div>';
      runModule();
      await flush();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('應對 CONFIG.serverIP 發出請求', async () => {
      globalThis.CONFIG = { serverIP: 'example.net' };
      runModule();
      await flush();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.mcsrvstat.us/3/example.net',
        expect.objectContaining({ signal: expect.anything() })
      );
    });

    it('CONFIG 不存在時應退回預設網域而非拋錯', async () => {
      delete globalThis.CONFIG;
      runModule();
      await flush();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.mcsrvstat.us/3/bydsmp.com',
        expect.anything()
      );
    });
  });

  // ── 狀態呈現 ──────────────────────────────────────────────

  describe('線上狀態', () => {
    it('應顯示人數、上限與線上標籤', async () => {
      runModule();
      await flush();

      expect(el('server-online-count').textContent).toBe('7');
      expect(el('server-max-count').textContent).toBe('/ 100');
      expect(el('server-status-label').textContent).toBe('伺服器線上');
      expect(el('server-status-dot').className).toBe('status-dot status-dot--online');
      expect(el('server-status-widget').classList.contains('is-offline')).toBe(false);
    });

    it('應更新 aria-label 供螢幕閱讀器播報人數', async () => {
      runModule();
      await flush();
      expect(el('server-status-widget').getAttribute('aria-label')).toBe('伺服器線上，目前 7 人');
    });

    it('人數變動時應加上 count-flip 動畫 class', async () => {
      runModule();
      await flush();
      expect(el('server-online-count').classList.contains('count-flip')).toBe(true);
    });

    it('上限超過 500 時應視為裝飾數字並改顯示「人在線」', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(apiResponse({ online: true, players: { online: 3, max: 114514 } }))
      );
      runModule();
      await flush();
      expect(el('server-max-count').textContent).toBe('人在線');
    });

    it('上限為 0 時應改顯示「人在線」', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(apiResponse({ online: true, players: { online: 3, max: 0 } }))
      );
      runModule();
      await flush();
      expect(el('server-max-count').textContent).toBe('人在線');
    });

    it('上限剛好 500 時仍應顯示為上限（邊界值）', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve(apiResponse({ online: true, players: { online: 3, max: 500 } }))
      );
      runModule();
      await flush();
      expect(el('server-max-count').textContent).toBe('/ 500');
    });

    it('回應缺少 players 欄位時應以 0 人呈現而非拋錯', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve(apiResponse({ online: true })));
      runModule();
      await flush();
      expect(el('server-online-count').textContent).toBe('0');
    });
  });

  describe('離線狀態', () => {
    beforeEach(() => {
      globalThis.fetch = vi.fn(() => Promise.resolve(apiResponse({ online: false })));
    });

    it('應顯示離線標籤與破折號', async () => {
      runModule();
      await flush();
      expect(el('server-status-label').textContent).toBe('伺服器離線');
      expect(el('server-online-count').textContent).toBe('—');
      expect(el('server-max-count').textContent).toBe('');
      expect(el('server-status-dot').className).toBe('status-dot status-dot--offline');
    });

    it('應為 widget 加上 is-offline 與對應 aria-label', async () => {
      runModule();
      await flush();
      expect(el('server-status-widget').classList.contains('is-offline')).toBe(true);
      expect(el('server-status-widget').getAttribute('aria-label')).toBe('伺服器目前離線');
    });
  });

  describe('錯誤狀態', () => {
    it('HTTP 非 2xx 時應顯示「無法取得狀態」', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 503 }));
      runModule();
      await flush();
      expect(el('server-status-label').textContent).toBe('無法取得狀態');
      expect(el('server-status-dot').className).toBe('status-dot status-dot--offline');
    });

    it('網路錯誤時應顯示「無法取得狀態」而非讓例外逸出', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('network down')));
      runModule();
      await flush();
      expect(el('server-status-label').textContent).toBe('無法取得狀態');
    });

    it('JSON 解析失敗時應顯示「無法取得狀態」', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.reject(new Error('bad json')) })
      );
      runModule();
      await flush();
      expect(el('server-status-label').textContent).toBe('無法取得狀態');
    });

    it('錯誤狀態不應把人數欄位清成離線樣式（保留上一次已知數值）', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('network down')));
      runModule();
      await flush();
      // setError 只動 dot 與 label，count 維持 setLoading 寫入的破折號
      expect(el('server-online-count').textContent).toBe('—');
      expect(el('server-status-widget').classList.contains('is-offline')).toBe(false);
    });
  });

  // ── 輪詢 ──────────────────────────────────────────────────

  describe('輪詢', () => {
    it('初始化時應立即查詢一次', async () => {
      runModule();
      await flush();
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('每 60 秒應再查詢一次', async () => {
      runModule();
      await flush();
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(POLL_MS);
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(POLL_MS);
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    it('未滿 60 秒不應提前查詢', async () => {
      runModule();
      await flush();
      await vi.advanceTimersByTimeAsync(POLL_MS - 1);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  // ── 逾時 ──────────────────────────────────────────────────

  describe('逾時處理', () => {
    it('請求超過 8 秒應被 AbortController 中止並顯示錯誤', async () => {
      let capturedSignal;
      globalThis.fetch = vi.fn((_url, opts) => {
        capturedSignal = opts.signal;
        return new Promise((_resolve, reject) => {
          opts.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      });

      runModule();
      await flush();
      expect(capturedSignal.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(8_000);
      expect(capturedSignal.aborted).toBe(true);
      expect(el('server-status-label').textContent).toBe('無法取得狀態');
    });
  });
  // ── 分頁可見性 ────────────────────────────────────────────
  //
  // 放在檔案最後：每個測試都會再執行一次模組，而模組會在 document 上掛
  // visibilitychange 監聽器且無從卸載。前面測試殘留的監聽器會在這裡一併觸發，
  // 因此斷言只看「有沒有再打 API」，不看精確次數。

  describe('分頁可見性', () => {
    it('分頁隱藏時應停止輪詢', async () => {
      runModule();
      await flush();

      globalThis.fetch.mockClear();
      setHidden(true);
      document.dispatchEvent(new Event('visibilitychange'));

      await vi.advanceTimersByTimeAsync(POLL_MS * 3);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('分頁恢復可見時應立即重新查詢', async () => {
      runModule();
      await flush();

      setHidden(true);
      document.dispatchEvent(new Event('visibilitychange'));

      globalThis.fetch.mockClear();
      setHidden(false);
      document.dispatchEvent(new Event('visibilitychange'));
      await flush();

      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });
});
