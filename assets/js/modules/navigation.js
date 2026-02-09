// Navigation Module
(function() {
    'use strict';
    
    function initScrollHide() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        let lastScrollY = window.scrollY;
        const scrollThreshold = 10;
        
        function onScroll() {
            const currentScrollY = window.scrollY;
            if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;
            if (currentScrollY > lastScrollY) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
            lastScrollY = currentScrollY;
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    
    function initNavigation() {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        
        if (!navLinks || !hamburger) return;
        
        // Toggle menu function
        function toggleMenu() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
        
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
        
        // Close menu when clicking outside (optional enhancement)
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
    
    // Export for global use (backward compatibility)
    window.toggleMenu = function() {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        if (navLinks && hamburger) {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
    };
})();
