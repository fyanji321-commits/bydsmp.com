// Navigation Module
// 導覽列永遠可見：頁面頂端透明，捲動超過門檻加 .is-scrolled 變實底；行動版漢堡選單開關。
(function() {
    'use strict';

    const SCROLL_THRESHOLD = 50;

    // Holds the toggle function once initMenu() runs;
    // window.toggleMenu delegates here so the global never re-queries the DOM.
    let _toggle = null;

    function initScrollState(nav) {
        function onScroll() {
            nav.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function initMenu(nav) {
        const navLinks = nav.querySelector('.nav-links');
        const hamburger = nav.querySelector('.hamburger');

        if (!navLinks || !hamburger) return;

        function setOpen(open) {
            navLinks.classList.toggle('active', open);
            hamburger.classList.toggle('active', open);
            nav.classList.toggle('is-open', open);
            hamburger.setAttribute('aria-expanded', String(open));
            hamburger.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
        }

        function isOpen() {
            return navLinks.classList.contains('active');
        }

        function toggleMenu() {
            setOpen(!isOpen());
        }

        _toggle = toggleMenu;

        hamburger.addEventListener('click', toggleMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (isOpen()) setOpen(false);
            });
        });

        document.addEventListener('click', (e) => {
            if (isOpen() && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                setOpen(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen()) {
                setOpen(false);
                hamburger.focus();
            }
        });
    }

    function init() {
        const nav = document.querySelector('.site-nav');
        if (!nav) return;
        initScrollState(nav);
        initMenu(nav);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.toggleMenu = function() {
        if (_toggle) _toggle();
    };
})();
