// @vitest-environment node
/**
 * api/leaderboard.mjs（Vercel Function）單元測試
 *
 * Function 是 ES module，直接 import；上游（Leaderboard 插件的唯讀 API）全程 mock fetch。
 *
 * 測試面向：
 *   - 方法限制、環境變數缺漏、view 白名單、各參數格式
 *   - 上游網址組法與密鑰 header
 *   - 成功 / 4xx / 5xx / 逾時 / 連線失敗時的狀態碼與快取 header
 *   - 錯誤訊息不得洩漏上游位址
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler, { UPSTREAM_TIMEOUT_MS } from '../../api/leaderboard.mjs';

const ORIGIN = 'http://203.0.113.7:8766';
const TOKEN = 'secret-token';

const call = (query = '', init = {}) =>
  handler.fetch(new Request('https://bydsmp.com/api/leaderboard' + query, init));

const upstream = (status, body) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('api/leaderboard', () => {
  beforeEach(() => {
    vi.stubEnv('LEADERBOARD_ORIGIN', ORIGIN);
    vi.stubEnv('LEADERBOARD_TOKEN', TOKEN);
    globalThis.fetch = vi.fn(() => upstream(200, { ladders: [] }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── 請求驗證 ──────────────────────────────────────────────

  describe('請求驗證', () => {
    it('非 GET 回 405 且不轉送', async () => {
      const res = await call('?view=meta', { method: 'POST' });
      expect(res.status).toBe(405);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it.each(['LEADERBOARD_ORIGIN', 'LEADERBOARD_TOKEN'])('缺 %s 回 500 且不連線', async (key) => {
      vi.stubEnv(key, '');
      const res = await call('?view=meta');
      expect(res.status).toBe(500);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it.each(['', '?view=admin', '?view=../meta'])('view 不在白名單（%s）回 400', async (query) => {
      const res = await call(query);
      expect(res.status).toBe(400);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it.each([
      ['ladder', 'a b'],
      ['ladder', 'x'.repeat(65)],
      ['sort', 'rating;drop'],
      ['name', 'Steve-1'],
      ['name', 'a'.repeat(17)],
    ])('%s=%s 格式不符回 400', async (key, value) => {
      const view = key === 'name' ? 'find' : 'board';
      const params = new URLSearchParams({ view, [key]: value });
      const res = await call('?' + params);
      expect(res.status).toBe(400);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('find 缺 name 回 400', async () => {
      const res = await call('?view=find&ladder=overall');
      expect(res.status).toBe(400);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  // ── 轉送 ──────────────────────────────────────────────────

  describe('轉送', () => {
    it('meta 打 /api/meta 並帶密鑰 header', async () => {
      await call('?view=meta&ladder=ignored');
      const [url, init] = globalThis.fetch.mock.calls[0];
      expect(url).toBe(ORIGIN + '/api/meta');
      expect(init.headers['X-Bydsmp-Token']).toBe(TOKEN);
    });

    it('board 只帶 ladder 與 sort', async () => {
      await call('?view=board&ladder=overall&sort=win-rate&name=Steve');
      expect(globalThis.fetch.mock.calls[0][0]).toBe(
        ORIGIN + '/api/board?ladder=overall&sort=win-rate'
      );
    });

    it('find 帶 ladder、sort、name，並正確編碼 #', async () => {
      await call('?view=find&ladder=nodebuff%231&sort=rating&name=Steve_01');
      expect(globalThis.fetch.mock.calls[0][0]).toBe(
        ORIGIN + '/api/find?ladder=nodebuff%231&sort=rating&name=Steve_01'
      );
    });

    it('ORIGIN 帶結尾斜線時不產生雙斜線', async () => {
      vi.stubEnv('LEADERBOARD_ORIGIN', ORIGIN + '/');
      await call('?view=meta');
      expect(globalThis.fetch.mock.calls[0][0]).toBe(ORIGIN + '/api/meta');
    });
  });

  // ── 回應 ──────────────────────────────────────────────────

  describe('回應', () => {
    it('上游 200 原樣轉出並加 CDN 快取', async () => {
      globalThis.fetch = vi.fn(() => upstream(200, { generatedAt: 1, ladders: [] }));
      const res = await call('?view=meta');
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ generatedAt: 1, ladders: [] });
      expect(res.headers.get('Cache-Control')).toBe(
        'public, s-maxage=60, stale-while-revalidate=600'
      );
      expect(res.headers.get('Content-Type')).toContain('application/json');
    });

    it.each([400, 404])('上游 %i 原樣轉出、短快取', async (status) => {
      globalThis.fetch = vi.fn(() => upstream(status, { error: 'not found' }));
      const res = await call('?view=board&ladder=gone');
      expect(res.status).toBe(status);
      expect(await res.json()).toEqual({ error: 'not found' });
      expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=60');
    });

    it.each([401, 429, 500, 503])('上游 %i 一律 502＋no-store', async (status) => {
      globalThis.fetch = vi.fn(() => upstream(status, { error: 'x' }));
      const res = await call('?view=meta');
      expect(res.status).toBe(502);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
    });

    it('連線失敗回 502，訊息不含上游位址', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('connect ECONNREFUSED ' + ORIGIN)));
      const res = await call('?view=meta');
      expect(res.status).toBe(502);
      expect(res.headers.get('Cache-Control')).toBe('no-store');
      expect(await res.text()).not.toContain('203.0.113.7');
    });

    it('上游逾時以 AbortSignal 中止並回 502', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.useFakeTimers();
      globalThis.fetch = vi.fn((url, init) => new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(init.signal.reason));
      }));
      const pending = call('?view=meta');
      await vi.advanceTimersByTimeAsync(UPSTREAM_TIMEOUT_MS);
      const res = await pending;
      expect(res.status).toBe(502);
    });
  });
});
