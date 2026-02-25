/**
 * modesScroll.js 整合測試
 * 驗證：IntersectionObserver 觸發 is-in-view 類別與 modes-animated 一次性動畫
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '../fixtures/modes.html');
const modulePath = join(__dirname, '../../assets/js/modules/modesScroll.js');

const fixtureHTML = readFileSync(fixturePath, 'utf8');
const modesScrollCode = readFileSync(modulePath, 'utf8');

describe('modesScroll (integration)', () => {
  let observerCallback;

  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;

    // mock IntersectionObserver，捕捉回呼以便手動觸發
    observerCallback = null;
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (callback) {
        observerCallback = callback;
        this.observe = vi.fn();
        this.disconnect = vi.fn();
      }),
    );

    const fn = new Function('document', 'window', modesScrollCode);
    fn(document, window);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('進入視窗時應加上 is-in-view', () => {
    const section = document.getElementById('modes');
    observerCallback([{ isIntersecting: true, target: section }]);
    expect(section.classList.contains('is-in-view')).toBe(true);
  });

  it('離開視窗時應移除 is-in-view', () => {
    const section = document.getElementById('modes');
    observerCallback([{ isIntersecting: true, target: section }]);
    observerCallback([{ isIntersecting: false, target: section }]);
    expect(section.classList.contains('is-in-view')).toBe(false);
  });

  it('進入視窗後 1200ms 應加上 modes-animated', () => {
    vi.useFakeTimers();
    const section = document.getElementById('modes');
    observerCallback([{ isIntersecting: true, target: section }]);
    expect(section.classList.contains('modes-animated')).toBe(false);
    vi.advanceTimersByTime(1200);
    expect(section.classList.contains('modes-animated')).toBe(true);
  });

  it('modes-animated 加上後再次進入/離開視窗不應重複加上（只會一次）', () => {
    vi.useFakeTimers();
    const section = document.getElementById('modes');

    // 第一次進入 → 等動畫結束
    observerCallback([{ isIntersecting: true, target: section }]);
    vi.advanceTimersByTime(1200);
    expect(section.classList.contains('modes-animated')).toBe(true);

    // 離開再進入 → setTimeout 不再被呼叫（因為 modes-animated 已存在）
    observerCallback([{ isIntersecting: false, target: section }]);
    observerCallback([{ isIntersecting: true, target: section }]);
    vi.advanceTimersByTime(1200);

    // 類別仍存在，沒有被移除
    expect(section.classList.contains('modes-animated')).toBe(true);
  });
});
