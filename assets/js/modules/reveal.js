// Reveal Module
// 帶 data-reveal 的元素進入視窗時加 .is-visible（只播一次）。
// 沒有 IntersectionObserver 或使用者偏好減少動態時，直接全部顯示。
(function() {
    'use strict';

    const SELECTOR = '[data-reveal]';

    function showAll(elements) {
        elements.forEach(el => el.classList.add('is-visible'));
    }

    function prefersReducedMotion() {
        return typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function init() {
        const elements = Array.from(document.querySelectorAll(SELECTOR));
        if (!elements.length) return;

        if (typeof window.IntersectionObserver !== 'function' || prefersReducedMotion()) {
            showAll(elements);
            return;
        }

        const observer = new window.IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
