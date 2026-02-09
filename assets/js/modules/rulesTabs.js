// Rules Page Tabs Module
(function() {
    'use strict';
    
    // 防止瀏覽器還原先前的捲動位置（從其他頁導航進入時，一律從頂部顯示）
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    function scrollToTop() { window.scrollTo(0, 0); }
    scrollToTop();
    
    // 瀏覽器可能在多個時機還原捲動，故在多個時機強制捲回頂部
    window.addEventListener('pageshow', function() { scrollToTop(); });
    window.addEventListener('DOMContentLoaded', scrollToTop);
    window.addEventListener('load', function() {
        scrollToTop();
        requestAnimationFrame(function() { scrollToTop(); });
        setTimeout(scrollToTop, 0);
        setTimeout(scrollToTop, 100);
    });
    
    function initRulesTabs() {
        const tabBtns = document.querySelectorAll('.rules-tab-btn');
        const panels = document.querySelectorAll('.rules-panel');
        
        if (!tabBtns.length || !panels.length) return;
        
        function switchTab(targetId) {
            tabBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === targetId);
                btn.setAttribute('aria-selected', btn.getAttribute('data-tab') === targetId);
            });
            panels.forEach(panel => {
                panel.classList.toggle('active', panel.id === targetId);
                panel.setAttribute('aria-hidden', panel.id !== targetId);
            });
            if (history.replaceState) {
                history.replaceState(null, '', window.location.pathname + '#' + targetId);
            }
        }
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-tab');
                if (targetId) switchTab(targetId);
            });
        });
        
        const hash = window.location.hash.slice(1);
        const validTab = Array.from(tabBtns).some(b => b.getAttribute('data-tab') === hash);
        if (hash && validTab) {
            switchTab(hash);
        } else {
            switchTab(panels[0].id);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRulesTabs);
    } else {
        initRulesTabs();
    }
})();
