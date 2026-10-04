/**
 * reveal.js 單元測試
 * 測試：進入視窗才加 .is-visible 且只觸發一次；沒有 IntersectionObserver 或偏好減少動態時直接顯示
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const revealCode = readFileSync(join(__dirname, '../../assets/js/modules/reveal.js'), 'utf8');

function runReveal() {
  new Function(revealCode)();
}

let observers;

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = new Set();
    observers.push(this);
  }
  observe(el) { this.observed.add(el); }
  unobserve(el) { this.observed.delete(el); }
  disconnect() { this.observed.clear(); }
  fire(el, isIntersecting) {
    this.callback([{ target: el, isIntersecting }]);
  }
}

function mockMatchMedia(reduce) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce });
}

describe('reveal', () => {
  const originalIO = window.IntersectionObserver;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    observers = [];
    document.body.innerHTML = `
      <div id="a" data-reveal></div>
      <div id="b" data-reveal></div>
      <div id="plain"></div>
    `;
    window.IntersectionObserver = MockIntersectionObserver;
    mockMatchMedia(false);
  });

  afterEach(() => {
    window.IntersectionObserver = originalIO;
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('應觀察所有 data-reveal 元素，未進入視窗前不加 is-visible', () => {
    runReveal();
    expect(observers).toHaveLength(1);
    expect(observers[0].observed.size).toBe(2);
    expect(document.getElementById('a').classList.contains('is-visible')).toBe(false);
  });

  it('進入視窗時加上 is-visible 並停止觀察（只播一次）', () => {
    runReveal();
    const a = document.getElementById('a');
    observers[0].fire(a, true);
    expect(a.classList.contains('is-visible')).toBe(true);
    expect(observers[0].observed.has(a)).toBe(false);
  });

  it('沒有交集的回呼不應加上 is-visible', () => {
    runReveal();
    const b = document.getElementById('b');
    observers[0].fire(b, false);
    expect(b.classList.contains('is-visible')).toBe(false);
  });

  it('不應碰沒有 data-reveal 的元素', () => {
    runReveal();
    expect(document.getElementById('plain').classList.contains('is-visible')).toBe(false);
  });

  it('沒有 IntersectionObserver 時直接全部顯示', () => {
    delete window.IntersectionObserver;
    runReveal();
    expect(document.getElementById('a').classList.contains('is-visible')).toBe(true);
    expect(document.getElementById('b').classList.contains('is-visible')).toBe(true);
  });

  it('偏好減少動態時直接全部顯示，不建立 observer', () => {
    mockMatchMedia(true);
    runReveal();
    expect(observers).toHaveLength(0);
    expect(document.getElementById('a').classList.contains('is-visible')).toBe(true);
  });

  it('頁面沒有 data-reveal 元素時不建立 observer', () => {
    document.body.innerHTML = '<div></div>';
    runReveal();
    expect(observers).toHaveLength(0);
  });
});
