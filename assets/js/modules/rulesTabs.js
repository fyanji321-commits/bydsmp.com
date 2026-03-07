// Rules Page Tabs Module
(function() {
    'use strict';
    
    // 防止瀏覽器還原先前的捲動位置（從其他頁導航進入時，一律從頂部顯示）
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // bfcache 還原時也強制回頂
    window.addEventListener('pageshow', function() { window.scrollTo(0, 0); });
    
    function initRulesTabs() {
        const tabBtns = document.querySelectorAll('.rules-tab-btn');
        const panels = document.querySelectorAll('.rules-panel');
        
        if (!tabBtns.length || !panels.length) return;
        
        function switchTab(targetId) {
            tabBtns.forEach(btn => {
                const isTarget = btn.getAttribute('data-tab') === targetId;
                btn.classList.toggle('active', isTarget);
                btn.setAttribute('aria-selected', String(isTarget));
            });
            panels.forEach(panel => {
                const isTarget = panel.id === targetId;
                panel.classList.toggle('active', isTarget);
                panel.setAttribute('aria-hidden', String(!isTarget));
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
        switchTab(hash && validTab ? hash : panels[0].id);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRulesTabs);
    } else {
        initRulesTabs();
    }
})();
