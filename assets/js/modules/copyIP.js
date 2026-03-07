// Copy IP Module - 點擊複製 IP，顯示「已複製IP位置」提示，無懸停動畫
(function() {
    'use strict';
    
    const TIP_TEXT = '已複製IP位置';
    let resetTimeout = null;
    let isCopying = false;
    
    function showToast(el) {
        if (el) {
            el.textContent = TIP_TEXT;
            el.classList.add('is-visible');
        }
    }
    
    function hideToast(el) {
        if (el) el.classList.remove('is-visible');
    }
    
    async function performCopy() {
        if (isCopying) return;
        
        const toast = document.getElementById('copy-toast');
        
        if (resetTimeout) {
            clearTimeout(resetTimeout);
            resetTimeout = null;
        }
        
        isCopying = true;
        
        const onSuccess = () => {
            showToast(toast);
            resetTimeout = setTimeout(() => {
                hideToast(toast);
                isCopying = false;
                resetTimeout = null;
            }, CONFIG.copyResetDelay);
        };
        
        try {
            await navigator.clipboard.writeText(CONFIG.serverIP);
            onSuccess();
        } catch (err) {
            console.error('無法複製文字: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = CONFIG.serverIP;
            textArea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                if (document.execCommand('copy')) {
                    onSuccess();
                } else {
                    isCopying = false;
                }
            } catch (e) {
                isCopying = false;
            }
            document.body.removeChild(textArea);
        }
    }
    
    function initCopyIP() {
        const ipBox = document.querySelector('.ip-box');
        if (!ipBox) return;
        ipBox.removeAttribute('onclick');
        ipBox.addEventListener('click', performCopy);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopyIP);
    } else {
        initCopyIP();
    }
    
    window.copyIP = performCopy;
})();
