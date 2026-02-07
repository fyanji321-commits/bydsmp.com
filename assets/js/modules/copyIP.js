// Copy IP Module
(function() {
    'use strict';
    
    function initCopyIP() {
        const ipBox = document.querySelector('.ip-box');
        
        if (!ipBox) return;
        
        ipBox.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(CONFIG.serverIP);
                
                // Visual feedback
                const originalText = ipBox.innerText;
                ipBox.innerText = CONFIG.copySuccessText;
                ipBox.style.borderColor = "#fff";
                ipBox.style.color = "#fff";
                
                // Reset after delay
                setTimeout(() => {
                    ipBox.innerText = originalText;
                    ipBox.style.borderColor = "var(--primary-color)";
                    ipBox.style.color = "var(--text-main)";
                }, CONFIG.copyResetDelay);
            } catch (err) {
                console.error('無法複製文字: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = CONFIG.serverIP;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    ipBox.innerText = CONFIG.copySuccessText;
                    setTimeout(() => {
                        ipBox.innerText = CONFIG.serverIP;
                    }, CONFIG.copyResetDelay);
                } catch (fallbackErr) {
                    console.error('複製失敗: ', fallbackErr);
                }
                document.body.removeChild(textArea);
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopyIP);
    } else {
        initCopyIP();
    }
    
    // Export for global use (backward compatibility)
    window.copyIP = async function() {
        const ipBox = document.querySelector('.ip-box');
        if (!ipBox) return;
        
        try {
            await navigator.clipboard.writeText(CONFIG.serverIP);
            const originalText = ipBox.innerText;
            ipBox.innerText = CONFIG.copySuccessText;
            ipBox.style.borderColor = "#fff";
            ipBox.style.color = "#fff";
            
            setTimeout(() => {
                ipBox.innerText = originalText;
                ipBox.style.borderColor = "var(--primary-color)";
                ipBox.style.color = "var(--text-main)";
            }, CONFIG.copyResetDelay);
        } catch (err) {
            console.error('無法複製文字: ', err);
        }
    };
})();
