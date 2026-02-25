/**
 * galleryCarousel.js 整合測試
 * 驗證：初始狀態、下一張/上一張按鈕、索引循環、防抖保護、自動播放、鍵盤導航
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '../fixtures/gallery.html');
const modulePath = join(__dirname, '../../assets/js/modules/galleryCarousel.js');

const fixtureHTML = readFileSync(fixturePath, 'utf8');
const carouselCode = readFileSync(modulePath, 'utf8');

const BASE_CONFIG = {
  galleryAutoPlay: false,       // 預設關閉，避免 timer 干擾
  galleryInterval: 5000,
  galleryTransitionDuration: 100, // 100ms（不能用 0，否則 `0 || 500 = 500`）
  galleryPauseOnHover: false,
};

function runCarousel(configOverrides = {}) {
  window.CONFIG = { ...BASE_CONFIG, ...configOverrides };
  const fn = new Function('document', 'window', 'CONFIG', carouselCode);
  fn(document, window, window.CONFIG);
}

/** 讓 transition setTimeout 完成 */
function flushTransition() {
  vi.advanceTimersByTime(100);
}

describe('galleryCarousel (integration)', () => {
  beforeEach(() => {
    document.body.innerHTML = fixtureHTML;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ── 初始狀態 ──────────────────────────────────────────────────

  it('只有第一張 slide 應為可見狀態（display 非 none）', () => {
    runCarousel();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[0].style.display).not.toBe('none');
    expect(slides[1].style.display).toBe('none');
    expect(slides[2].style.display).toBe('none');
  });

  it('指示器數量應與 slide 數量相同', () => {
    runCarousel();
    const slides = document.querySelectorAll('.gallery-slide');
    const indicators = document.querySelectorAll('.gallery-indicator');
    expect(indicators.length).toBe(slides.length);
  });

  it('第一個指示器應有 active 類別', () => {
    runCarousel();
    const indicators = document.querySelectorAll('.gallery-indicator');
    expect(indicators[0].classList.contains('active')).toBe(true);
    expect(indicators[1].classList.contains('active')).toBe(false);
  });

  // ── 下一張 / 上一張 ──────────────────────────────────────────

  it('點擊下一張後第二張應為 active', () => {
    runCarousel();
    document.querySelector('.gallery-next').click();
    flushTransition();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[1].classList.contains('active')).toBe(true);
    expect(slides[0].style.display).toBe('none');
  });

  it('在第一張時點擊上一張應循環至最後一張', () => {
    runCarousel();
    document.querySelector('.gallery-prev').click();
    flushTransition();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[slides.length - 1].classList.contains('active')).toBe(true);
  });

  it('在最後一張時點擊下一張應循環至第一張', () => {
    runCarousel();
    const nextBtn = document.querySelector('.gallery-next');
    // 前進到最後一張（3 張，需點 2 次）
    nextBtn.click(); flushTransition();
    nextBtn.click(); flushTransition();
    // 再點一次應回到第一張
    nextBtn.click(); flushTransition();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[0].classList.contains('active')).toBe(true);
  });

  // ── isTransitioning 防抖 ──────────────────────────────────────

  it('過渡動畫進行中再次點擊下一張應被忽略', () => {
    runCarousel();
    const nextBtn = document.querySelector('.gallery-next');
    nextBtn.click(); // 開始第一次過渡，isTransitioning = true
    nextBtn.click(); // 此時應被忽略
    // 不 flushTransition：第二次點擊若有效，slide[2] 會有 active
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[2].classList.contains('active')).toBe(false);
  });

  // ── 自動播放 ─────────────────────────────────────────────────

  it('galleryAutoPlay 啟用時，間隔後應自動前進到下一張', () => {
    runCarousel({ galleryAutoPlay: true });
    vi.advanceTimersByTime(5000 + 100); // interval + transition cleanup
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[1].classList.contains('active')).toBe(true);
  });

  // ── 鍵盤導航 ─────────────────────────────────────────────────

  it('ArrowRight 鍵應前進到下一張', () => {
    runCarousel();
    const carousel = document.querySelector('.gallery-carousel');
    carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    flushTransition();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[1].classList.contains('active')).toBe(true);
  });

  it('ArrowLeft 鍵應循環至最後一張（從第一張往前）', () => {
    runCarousel();
    const carousel = document.querySelector('.gallery-carousel');
    carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    flushTransition();
    const slides = document.querySelectorAll('.gallery-slide');
    expect(slides[slides.length - 1].classList.contains('active')).toBe(true);
  });
});
