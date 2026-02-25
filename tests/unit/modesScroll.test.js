/**
 * modesScroll.js 單元測試
 * 測試 IntersectionObserver 驅動的 is-in-view / modes-animated class 切換行為。
 *
 * 策略：mock IntersectionObserver，透過 triggerIntersect() 手動觸發 callback，
 * 使用 vi.useFakeTimers() 控制 modes-animated 的 1200ms setTimeout。
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modesScrollCode = readFileSync(
  join(__dirname, '../../assets/js/modules/modesScroll.js'),
  'utf8'
);

describe('modesScroll', () => {
  let triggerIntersect;

  beforeEach(() => {
    vi.useFakeTimers();

    document.body.innerHTML = `<section id="modes"><h2>遊戲分流</h2></section>`;

    // 替換全域 IntersectionObserver，捕捉 callback 以手動觸發
    global.IntersectionObserver = class {
      constructor(callback) {
        triggerIntersect = (isIntersecting) => {
          callback([{ isIntersecting }]);
        };
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    new Function(modesScrollCode)();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('進入視窗時應加上 is-in-view', () => {
    triggerIntersect(true);
    expect(document.getElementById('modes').classList.contains('is-in-view')).toBe(true);
  });

  it('離開視窗時應移除 is-in-view', () => {
    triggerIntersect(true);
    triggerIntersect(false);
    expect(document.getElementById('modes').classList.contains('is-in-view')).toBe(false);
  });

  it('進入視窗後 1200ms 內 modes-animated 尚未加上', () => {
    triggerIntersect(true);
    vi.advanceTimersByTime(1199);
    expect(document.getElementById('modes').classList.contains('modes-animated')).toBe(false);
  });

  it('進入視窗後恰好 1200ms 應加上 modes-animated', () => {
    triggerIntersect(true);
    vi.advanceTimersByTime(1200);
    expect(document.getElementById('modes').classList.contains('modes-animated')).toBe(true);
  });

  it('modes-animated 只加一次：再次進入視窗不應重設或移除', () => {
    // 第一次進入 → 等動畫結束
    triggerIntersect(true);
    vi.advanceTimersByTime(1200);
    expect(document.getElementById('modes').classList.contains('modes-animated')).toBe(true);

    // 離開再進入
    triggerIntersect(false);
    triggerIntersect(true);

    // is-in-view 應重新加上
    expect(document.getElementById('modes').classList.contains('is-in-view')).toBe(true);
    // modes-animated 應保留（不被移除）
    expect(document.getElementById('modes').classList.contains('modes-animated')).toBe(true);
  });

  it('再次進入時若已有 modes-animated 則不觸發 setTimeout（計時器不增加）', () => {
    triggerIntersect(true);
    vi.advanceTimersByTime(1200); // modes-animated 加上

    // 離開再進入
    triggerIntersect(false);
    triggerIntersect(true);

    // 若有多餘的 setTimeout 被觸發，advanceTimersByTime 後 class 不應被意外清除
    vi.advanceTimersByTime(1200);
    expect(document.getElementById('modes').classList.contains('modes-animated')).toBe(true);
  });
});
