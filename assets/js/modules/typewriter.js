// Typewriter Effect Module
(function() {
    'use strict';
    
    let currentSloganIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typeTimeout = null;
    
    function initTypewriter() {
        const subtitleElement = document.getElementById('hero-subtitle');
        
        if (!subtitleElement || !CONFIG.heroSlogans || !CONFIG.heroSlogans.length) {
            return;
        }
        
        // 確保配置存在
        const speed = CONFIG.typewriterSpeed || 100;
        const deleteSpeed = CONFIG.typewriterDeleteSpeed || 50;
        const pauseBeforeDelete = CONFIG.typewriterPauseBeforeDelete || 2000;
        const pauseAfterDelete = CONFIG.typewriterPauseAfterDelete || 500;
        
        function typeWriter() {
            const currentSlogan = CONFIG.heroSlogans[currentSloganIndex];
            
            if (isDeleting) {
                // 刪除字符
                subtitleElement.textContent = currentSlogan.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    // 刪除完成，切換到下一個標語
                    isDeleting = false;
                    currentSloganIndex = (currentSloganIndex + 1) % CONFIG.heroSlogans.length;
                    typeTimeout = setTimeout(typeWriter, pauseAfterDelete);
                    return;
                }
                
                typeTimeout = setTimeout(typeWriter, deleteSpeed);
            } else {
                // 輸入字符
                subtitleElement.textContent = currentSlogan.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentSlogan.length) {
                    // 輸入完成，等待後開始刪除
                    isDeleting = true;
                    typeTimeout = setTimeout(typeWriter, pauseBeforeDelete);
                    return;
                }
                
                typeTimeout = setTimeout(typeWriter, speed);
            }
        }
        
        // 開始打字機效果
        typeWriter();
        
        // 清理函數（如果需要）
        window.addEventListener('beforeunload', function() {
            if (typeTimeout) {
                clearTimeout(typeTimeout);
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTypewriter);
    } else {
        initTypewriter();
    }
})();
