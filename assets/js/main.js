// Main JavaScript Entry Point
// 把 CONFIG 的值綁到各頁共用的 DOM（導覽列、頁尾、CTA）。HTML 內已寫好預設值，沒有 JS 也能用；
// 這裡讓 config.js 成為唯一的來源。功能模組各自初始化，本檔只做跨頁資料綁定。
//   data-config-text="key"   → textContent = CONFIG[key]
//   data-config-href="key"   → href = CONFIG[key]
//   data-config-mailto="key" → textContent = CONFIG[key]、href = mailto:CONFIG[key]
(function() {
    'use strict';

    function eachWithKey(attr, fn) {
        document.querySelectorAll('[' + attr + ']').forEach(function(el) {
            const value = CONFIG[el.getAttribute(attr)];
            if (typeof value === 'string' && value) fn(el, value);
        });
    }

    function injectConfigValues() {
        if (typeof CONFIG === 'undefined') return;

        eachWithKey('data-config-text', function(el, value) {
            el.textContent = value;
        });

        eachWithKey('data-config-href', function(el, value) {
            el.setAttribute('href', value);
        });

        eachWithKey('data-config-mailto', function(el, value) {
            el.textContent = value;
            el.setAttribute('href', 'mailto:' + value);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectConfigValues);
    } else {
        injectConfigValues();
    }
})();
