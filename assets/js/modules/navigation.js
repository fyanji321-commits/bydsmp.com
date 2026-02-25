// Navigation Module
(function() {
    'use strict';

    // Holds the toggle function once initNavigation() runs;
    // window.toggleMenu delegates here so the global never re-queries the DOM.
    let _toggle = null;

    function initScrollHide() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const isSubPage = /rules\.html?$/.test(window.location.pathname) || window.location.pathname.endsWith('/rules')
            || /sponsor\.html?$/.test(window.location.pathname) || window.location.pathname.endsWith('/sponsor');
        if (isSubPage) {
            return;
        }
        nav.classList.add('nav-hidden');
        const showThreshold = 50;

        function onScroll() {
            const currentScrollY = window.scrollY;
            if (currentScrollY > showThreshold) {
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
            // Keep aria-expanded in sync so screen readers announce menu state
            hamburger.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
        }

        // Expose to window via the module-level reference (no DOM re-query)
        _toggle = toggleMenu;

        // Hamburger click handler
        hamburger.addEventListener('click', toggleMenu);

        // Close menu when clicking nav links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only close if menu is active (mobile)
                if (navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        // Close menu when clicking outside
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

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for global use — delegates to the internal function so there
    // is one toggle implementation and no repeated DOM queries.
    window.toggleMenu = function() {
        if (_toggle) _toggle();
    };
})();
