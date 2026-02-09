// 遊戲分流區塊：滾動至視窗時 is-in-view（背景淡化），動畫只播一次（modes-animated）
(function() {
    'use strict';

    var ANIMATION_END_MS = 1200;

    function init() {
        var section = document.getElementById('modes');
        if (!section) return;

        var observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        section.classList.add('is-in-view');
                        if (!section.classList.contains('modes-animated')) {
                            setTimeout(function() {
                                section.classList.add('modes-animated');
                            }, ANIMATION_END_MS);
                        }
                    } else {
                        section.classList.remove('is-in-view');
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(section);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
