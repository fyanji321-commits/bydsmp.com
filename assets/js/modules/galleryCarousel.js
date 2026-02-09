// Gallery Carousel Module
(function() {
    'use strict';
    
    let currentIndex = 0;
    let autoPlayInterval = null;
    let isTransitioning = false;
    let slides = [];
    let indicators = [];
    
    function initGalleryCarousel() {
        const carousel = document.querySelector('.gallery-carousel');
        const prevBtn = document.querySelector('.gallery-prev');
        const nextBtn = document.querySelector('.gallery-next');
        const indicatorsContainer = document.querySelector('.gallery-indicators');
        if (!carousel || !prevBtn || !nextBtn) return;
        
        slides = Array.from(carousel.querySelectorAll('.gallery-slide'));
        if (slides.length === 0) return;
        
        // 設置初始狀態
        slides.forEach((slide, index) => {
            slide.style.display = index === 0 ? 'block' : 'none';
            slide.classList.toggle('active', index === 0);
        });
        
        // 創建指示器
        slides.forEach((slide, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'gallery-indicator';
            indicator.setAttribute('role', 'tab');
            indicator.setAttribute('aria-label', `切換到圖片 ${index + 1}`);
            indicator.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
            indicators.push(indicator);
        });
        
        // 更新指示器狀態
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
                indicator.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
            });
        }
        
        // 切換到指定幻燈片
        function goToSlide(index, direction = 'next') {
            if (isTransitioning) return;
            
            isTransitioning = true;
            const prevIndex = currentIndex;
            currentIndex = index;
            
            // 確保索引在範圍內
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            } else if (currentIndex >= slides.length) {
                currentIndex = 0;
            }
            
            // 移除舊的活動狀態
            slides[prevIndex].classList.remove('active');
            slides[prevIndex].classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
            
            // 設置新的活動狀態
            slides[currentIndex].style.display = 'block';
            slides[currentIndex].classList.add('active');
            slides[currentIndex].classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
            
            // 更新指示器
            updateIndicators();
            
            // 清理動畫類
            setTimeout(() => {
                slides[prevIndex].classList.remove('slide-out-left', 'slide-out-right', 'active');
                slides[prevIndex].style.display = 'none';
                slides[currentIndex].classList.remove('slide-in-left', 'slide-in-right');
                isTransitioning = false;
            }, CONFIG.galleryTransitionDuration || 500);
            
            // 重置自動播放
            resetAutoPlay();
        }
        
        // 下一張
        function nextSlide() {
            goToSlide(currentIndex + 1, 'next');
        }
        
        // 上一張
        function prevSlide() {
            goToSlide(currentIndex - 1, 'prev');
        }
        
        // 自動播放
        function startAutoPlay() {
            if (!CONFIG.galleryAutoPlay) return;
            
            autoPlayInterval = setInterval(() => {
                nextSlide();
            }, CONFIG.galleryInterval || 5000);
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        function resetAutoPlay() {
            stopAutoPlay();
            if (CONFIG.galleryAutoPlay) {
                startAutoPlay();
            }
        }
        
        // 事件監聽
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
        
        // 懸停暫停
        if (CONFIG.galleryPauseOnHover) {
            carousel.addEventListener('mouseenter', stopAutoPlay);
            carousel.addEventListener('mouseleave', startAutoPlay);
        }
        
        // 鍵盤導航
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
        
        // 觸摸支持（移動設備）
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }
        
        // 初始化指示器與說明
        updateIndicators();
        
        // 開始自動播放
        startAutoPlay();
        
        // 預加載下一張圖片
        function preloadNextImage() {
            const nextIndex = (currentIndex + 1) % slides.length;
            const nextImg = slides[nextIndex].querySelector('img');
            if (nextImg && nextImg.getAttribute('loading') === 'lazy') {
                const img = new Image();
                img.src = nextImg.src;
            }
        }
        
        // 監聽切換事件以預加載
        const observer = new MutationObserver(() => {
            preloadNextImage();
        });
        
        observer.observe(carousel, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // 初始預加載
        preloadNextImage();
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGalleryCarousel);
    } else {
        initGalleryCarousel();
    }
})();
