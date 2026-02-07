// Background Slider Module
(function() {
    'use strict';
    
    function initBackgroundSlider() {
        const hero = document.querySelector('.hero');
        
        if (!hero || !CONFIG.backgroundImages || !CONFIG.backgroundImages.length) return;
        
        const bgImages = CONFIG.backgroundImages;
        let currentBgIndex = 0;
        
        // Preload images for smooth transitions
        bgImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        function changeBackground() {
            hero.style.backgroundImage = 
                `linear-gradient(rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 0.9)), url('${bgImages[currentBgIndex]}')`;
            currentBgIndex = (currentBgIndex + 1) % bgImages.length;
        }
        
        // Set initial background
        changeBackground();
        
        // Start slider interval
        setInterval(changeBackground, CONFIG.sliderInterval);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackgroundSlider);
    } else {
        initBackgroundSlider();
    }
})();
