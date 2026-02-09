// Copy IP Module - 點擊複製 IP，顯示「已複製IP位置」提示，無懸停動畫
(function() {
    'use strict';
    
    const TIP_TEXT = '已複製IP位置';
    let resetTimeout = null;
    let isCopying = false;
    
    function initCopyIP() {
        const ipBox = document.querySelector('.ip-box');
        const toast = document.getElementById('copy-toast');
        
        if (!ipBox) return;
        
        ipBox.removeAttribute('onclick');
        
        ipBox.addEventListener('click', async function handleCopy() {
            if (isCopying) return;
            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }
            
            isCopying = true;
            
            try {
                await navigator.clipboard.writeText(CONFIG.serverIP);
                showToast(toast);
                resetTimeout = setTimeout(() => {
                    hideToast(toast);
                    isCopying = false;
                    resetTimeout = null;
                }, CONFIG.copyResetDelay);
            } catch (err) {
                console.error('無法複製文字: ', err);
                const textArea = document.createElement('textarea');
                textArea.value = CONFIG.serverIP;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    if (document.execCommand('copy')) {
                        showToast(toast);
                        resetTimeout = setTimeout(() => {
                            hideToast(toast);
                            isCopying = false;
                            resetTimeout = null;
                        }, CONFIG.copyResetDelay);
                    } else {
                        isCopying = false;
                    }
                } catch (e) {
                    isCopying = false;
                }
                document.body.removeChild(textArea);
            }
        });
    }
    
    function showToast(el) {
        if (el) {
            el.textContent = TIP_TEXT;
            el.classList.add('is-visible');
        }
    }
    
    function hideToast(el) {
        if (el) el.classList.remove('is-visible');
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopyIP);
    } else {
        initCopyIP();
    }
    
    window.copyIP = async function() {
        const ipBox = document.querySelector('.ip-box');
        const toast = document.getElementById('copy-toast');
        if (!ipBox) return;
        if (isCopying) return;
        if (resetTimeout) {
            clearTimeout(resetTimeout);
            resetTimeout = null;
        }
        isCopying = true;
        try {
            await navigator.clipboard.writeText(CONFIG.serverIP);
            showToast(toast);
            resetTimeout = setTimeout(() => {
                hideToast(toast);
                isCopying = false;
                resetTimeout = null;
            }, CONFIG.copyResetDelay);
        } catch (err) {
            console.error('無法複製文字: ', err);
            isCopying = false;
        }
    };
})();
