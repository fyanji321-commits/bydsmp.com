// Copy IP Module
(function() {
    'use strict';
    
    let resetTimeout = null;
    let isCopying = false;
    let originalText = '';
    let hoverTimeout = null;
    
    function initCopyIP() {
        const ipBox = document.querySelector('.ip-box');
        
        if (!ipBox) return;
        
        // Store original text
        originalText = ipBox.textContent.trim();
        
        // Remove onclick attribute to prevent double binding
        ipBox.removeAttribute('onclick');
        
        // Hover effect: change text on mouseenter
        ipBox.addEventListener('mouseenter', function() {
            // Don't change text if copying or if already showing success message
            if (isCopying || ipBox.textContent.trim() === CONFIG.copySuccessText) return;
            
            // Clear any existing hover timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            ipBox.textContent = '點擊複製連線位置';
        });
        
        // Restore original text on mouseleave
        ipBox.addEventListener('mouseleave', function() {
            // Don't change text if copying or if showing success message
            if (isCopying || ipBox.textContent.trim() === CONFIG.copySuccessText) return;
            
            // Clear any existing hover timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            ipBox.textContent = originalText;
        });
        
        ipBox.addEventListener('click', async function handleCopy() {
            // Prevent multiple simultaneous copies
            if (isCopying) return;
            
            // Clear any existing timeout
            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }
            
            isCopying = true;
            
            // Clear hover timeout if exists
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            
            // Store original values
            const currentText = ipBox.textContent.trim();
            const originalBorderColor = getComputedStyle(ipBox).borderColor;
            const originalColor = getComputedStyle(ipBox).color;
            
            try {
                await navigator.clipboard.writeText(CONFIG.serverIP);
                
                // Visual feedback
                ipBox.textContent = CONFIG.copySuccessText;
                ipBox.style.borderColor = "#fff";
                ipBox.style.color = "#fff";
                
                // Reset after delay
                resetTimeout = setTimeout(() => {
                    ipBox.textContent = originalText;
                    ipBox.style.borderColor = "";
                    ipBox.style.color = "";
                    isCopying = false;
                    resetTimeout = null;
                }, CONFIG.copyResetDelay);
            } catch (err) {
                console.error('無法複製文字: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = CONFIG.serverIP;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        // Visual feedback
                        ipBox.textContent = CONFIG.copySuccessText;
                        ipBox.style.borderColor = "#fff";
                        ipBox.style.color = "#fff";
                        
                        // Reset after delay
                        resetTimeout = setTimeout(() => {
                            ipBox.textContent = originalText;
                            ipBox.style.borderColor = "";
                            ipBox.style.color = "";
                            isCopying = false;
                            resetTimeout = null;
                        }, CONFIG.copyResetDelay);
                    } else {
                        isCopying = false;
                    }
                } catch (fallbackErr) {
                    console.error('複製失敗: ', fallbackErr);
                    isCopying = false;
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
        
        // Prevent multiple simultaneous copies
        if (isCopying) return;
        
        // Clear any existing timeout
        if (resetTimeout) {
            clearTimeout(resetTimeout);
            resetTimeout = null;
        }
        
        isCopying = true;
        
        // Clear hover timeout if exists
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        
        // Store original text if not already stored
        if (!originalText) {
            originalText = ipBox.textContent.trim();
        }
        
        try {
            await navigator.clipboard.writeText(CONFIG.serverIP);
            
            // Visual feedback
            ipBox.textContent = CONFIG.copySuccessText;
            ipBox.style.borderColor = "#fff";
            ipBox.style.color = "#fff";
            
            // Reset after delay
            resetTimeout = setTimeout(() => {
                ipBox.textContent = originalText;
                ipBox.style.borderColor = "";
                ipBox.style.color = "";
                isCopying = false;
                resetTimeout = null;
            }, CONFIG.copyResetDelay);
        } catch (err) {
            console.error('無法複製文字: ', err);
            isCopying = false;
        }
    };
})();
