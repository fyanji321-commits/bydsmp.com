// Navigation Module
(function() {
    'use strict';

    // Holds the toggle function once initNavigation() runs;
    // window.toggleMenu delegates here so the global never re-queries the DOM.
    let _toggle = null;

    function initScrollHide() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Pages that opt out of the scroll-hide behaviour declare data-nav="always-visible"
        // on the <nav> element, keeping JS decoupled from URL path strings.
        if (nav.dataset.nav === 'always-visible') return;

        nav.classList.add('nav-hidden');
        const showThreshold = 50;

        function onScroll() {
            if (window.scrollY > showThreshold) {
                nav.classList.remove('nav-hidden');
            } else {
                nav.classList.add('nav-hidden');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function initNavigation() {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');

        if (!navLinks || !hamburger) return;

        function toggleMenu() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
        }

        _toggle = toggleMenu;

        hamburger.addEventListener('click', toggleMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) toggleMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target)) {
                toggleMenu();
            }
        });
    }

    function init() {
        initScrollHide();
        initNavigation();
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
