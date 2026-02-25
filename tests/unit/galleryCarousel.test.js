/**
 * galleryCarousel.js 單元測試
 * 測試：初始化、prev/next 切換、邊界包覆、isTransitioning 防護、
 *        觸控滑動、鍵盤導航、自動播放開關。
 *
 * CONFIG.galleryAutoPlay 預設為 false，避免計時器洩漏。
 * CONFIG.galleryTransitionDuration 設為 100（>0，避免 0||500 回退）。
 * vi.useFakeTimers() 用來控制 setTimeout / setInterval。
 *
 * Touch 事件以 new Event + changedTouches 屬性模擬（規避 jsdom TouchEvent 限制）。
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const galleryCode = readFileSync(
  join(__dirname, '../../assets/js/modules/galleryCarousel.js'),
  'utf8'
);

const GALLERY_HTML = `
  <div class="gallery-carousel-container">
    <button class="gallery-nav-btn gallery-prev" aria-label="上一張" type="button"></button>
    <div class="gallery-carousel" role="list">
      <div class="gallery-slide" role="listitem">
        <img src="https://example.com/1.jpg" alt="Slide 1" loading="eager" width="800" height="600">
      </div>
      <div class="gallery-slide" role="listitem">
        <img src="https://example.com/2.jpg" alt="Slide 2" loading="lazy" width="800" height="600">
      </div>
      <div class="gallery-slide" role="listitem">
        <img src="https://example.com/3.jpg" alt="Slide 3" loading="lazy" width="800" height="600">
      </div>
    </div>
    <button class="gallery-nav-btn gallery-next" aria-label="下一張" type="button"></button>
    <div class="gallery-indicators" role="tablist"></div>
  </div>
`;

const BASE_CONFIG = {
  galleryAutoPlay: false,
  galleryInterval: 5000,
  galleryTransitionDuration: 100, // must be >0 to avoid 0||500 fallback
  galleryPauseOnHover: true,
};

function runGallery() {
  new Function(galleryCode)();
}

/** 模擬 touch 事件（相容 jsdom） */
function fireTouch(element, type, screenX) {
  const event = new Event(type, { bubbles: true });
  event.changedTouches = [{ screenX }];
  element.dispatchEvent(event);
}

/** 推進計時器，讓過渡動畫結束 */
function finishTransition() {
  vi.advanceTimersByTime(BASE_CONFIG.galleryTransitionDuration + 10);
}

describe('galleryCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = GALLERY_HTML;
    window.CONFIG = { ...BASE_CONFIG };
    runGallery();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── 初始化 ────────────────────────────────────────────────────────────────

  describe('初始化', () => {
    it('應顯示第一張幻燈片，其餘設為 display:none', () => {
      const slides = document.querySelectorAll('.gallery-slide');
      expect(slides[0].style.display).not.toBe('none');
      expect(slides[1].style.display).toBe('none');
      expect(slides[2].style.display).toBe('none');
    });

    it('應為每張幻燈片生成對應的指示器', () => {
      const slides = document.querySelectorAll('.gallery-slide');
      const indicators = document.querySelectorAll('.gallery-indicator');
      expect(indicators.length).toBe(slides.length);
    });

    it('第一個指示器應標記為 active', () => {
      const indicators = document.querySelectorAll('.gallery-indicator');
      expect(indicators[0].classList.contains('active')).toBe(true);
      expect(indicators[1].classList.contains('active')).toBe(false);
    });

    it('指示器應有 role="tab" 和 aria-label', () => {
      const indicator = document.querySelector('.gallery-indicator');
      expect(indicator.getAttribute('role')).toBe('tab');
      expect(indicator.getAttribute('aria-label')).toBeTruthy();
    });
  });

  // ── 下一張 / 上一張 ───────────────────────────────────────────────────────

  describe('Next / Prev 按鈕', () => {
    it('點擊下一張應切換到第二張', () => {
      document.querySelector('.gallery-next').click();
      finishTransition();

      const slides = document.querySelectorAll('.gallery-slide');
      expect(slides[0].style.display).toBe('none');
      expect(slides[1].style.display).not.toBe('none');
    });

    it('點擊下一張後指示器應更新', () => {
      document.querySelector('.gallery-next').click();
      finishTransition();

      const indicators = document.querySelectorAll('.gallery-indicator');
      expect(indicators[0].classList.contains('active')).toBe(false);
      expect(indicators[1].classList.contains('active')).toBe(true);
    });

    it('從最後一張點下一張應包覆到第一張', () => {
      const next = document.querySelector('.gallery-next');
      next.click(); finishTransition();
      next.click(); finishTransition();
      next.click(); finishTransition(); // 3 slides → back to 0

      expect(document.querySelectorAll('.gallery-slide')[0].style.display).not.toBe('none');
    });

    it('從第一張點上一張應包覆到最後一張', () => {
      document.querySelector('.gallery-prev').click();
      finishTransition();

      const slides = document.querySelectorAll('.gallery-slide');
      expect(slides[2].style.display).not.toBe('none');
      expect(slides[0].style.display).toBe('none');
    });
  });

  // ── isTransitioning 防護 ──────────────────────────────────────────────────

  describe('isTransitioning 防護', () => {
    it('切換動畫中快速連點第二次應被忽略', () => {
      const next = document.querySelector('.gallery-next');
      next.click(); // isTransitioning = true
      next.click(); // 應被忽略

      // 只推進一半的過渡時間
      vi.advanceTimersByTime(50);

      // 第三張（index 2）不應被觸及
      expect(document.querySelectorAll('.gallery-slide')[2].style.display).toBe('none');
    });

    it('過渡完成後應可再次切換', () => {
      const next = document.querySelector('.gallery-next');
      next.click();
      finishTransition(); // isTransitioning reset to false
      next.click();
      finishTransition();

      // 應該到第三張（index 2）
      expect(document.querySelectorAll('.gallery-slide')[2].style.display).not.toBe('none');
    });
  });

  // ── 觸控滑動 ──────────────────────────────────────────────────────────────

  describe('觸控滑動', () => {
    it('向左滑動（startX > endX，差值 > 50）應前進到下一張', () => {
      const carousel = document.querySelector('.gallery-carousel');
      fireTouch(carousel, 'touchstart', 200);
      fireTouch(carousel, 'touchend', 100); // diff = 100 > 50 → next
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[1].style.display).not.toBe('none');
    });

    it('向右滑動（endX > startX，差值 > 50）應退回上一張', () => {
      const carousel = document.querySelector('.gallery-carousel');
      fireTouch(carousel, 'touchstart', 100);
      fireTouch(carousel, 'touchend', 200); // diff = -100 → prev
      finishTransition();

      // 從第一張往前 → 包覆到最後一張
      expect(document.querySelectorAll('.gallery-slide')[2].style.display).not.toBe('none');
    });

    it('滑動距離小於 50px 不應切換', () => {
      const carousel = document.querySelector('.gallery-carousel');
      fireTouch(carousel, 'touchstart', 200);
      fireTouch(carousel, 'touchend', 160); // diff = 40 < 50 → no change
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[0].style.display).not.toBe('none');
      expect(document.querySelectorAll('.gallery-slide')[1].style.display).toBe('none');
    });
  });

  // ── 鍵盤導航 ──────────────────────────────────────────────────────────────

  describe('鍵盤導航', () => {
    it('ArrowRight 應前進到下一張', () => {
      const carousel = document.querySelector('.gallery-carousel');
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[1].style.display).not.toBe('none');
    });

    it('ArrowLeft 應退回上一張（從第一張到最後一張）', () => {
      const carousel = document.querySelector('.gallery-carousel');
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[2].style.display).not.toBe('none');
    });

    it('其他按鍵不應觸發切換', () => {
      const carousel = document.querySelector('.gallery-carousel');
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      finishTransition();

      // 第一張應保持顯示
      expect(document.querySelectorAll('.gallery-slide')[0].style.display).not.toBe('none');
      expect(document.querySelectorAll('.gallery-slide')[1].style.display).toBe('none');
    });
  });

  // ── 自動播放 ──────────────────────────────────────────────────────────────

  describe('自動播放', () => {
    it('galleryAutoPlay 為 false 時不應自動切換', () => {
      // beforeEach 設 galleryAutoPlay: false，等足夠長時間
      vi.advanceTimersByTime(10000);
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[0].style.display).not.toBe('none');
    });

    it('galleryAutoPlay 為 true 時應在 galleryInterval 後自動前進', () => {
      // 重新初始化，啟用自動播放
      document.body.innerHTML = GALLERY_HTML;
      window.CONFIG = { ...BASE_CONFIG, galleryAutoPlay: true };
      runGallery();

      vi.advanceTimersByTime(5000); // galleryInterval
      finishTransition();

      expect(document.querySelectorAll('.gallery-slide')[1].style.display).not.toBe('none');
    });
  });
});
