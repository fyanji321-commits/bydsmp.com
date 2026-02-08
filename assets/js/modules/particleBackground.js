// Particle Background Module - 現代化漂浮點背景
(function() {
    'use strict';
    
    let canvas, ctx;
    let particles = [];
    let animationId = null;
    let mouse = { x: 0, y: 0 };
    
    // 配置
    const config = {
        particleCount: 80,
        connectionDistance: 150,
        particleSpeed: 0.5,
        lineOpacity: 0.3,
        particleColor: '#FF79BC',
        lineColor: '#FF79BC'
    };
    
    // 粒子類
    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * config.particleSpeed;
            this.vy = (Math.random() - 0.5) * config.particleSpeed;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            // 更新位置
            this.x += this.vx;
            this.y += this.vy;
            
            // 邊界反彈
            if (this.x < 0 || this.x > window.innerWidth) {
                this.vx *= -1;
            }
            if (this.y < 0 || this.y > window.innerHeight) {
                this.vy *= -1;
            }
            
            // 確保粒子在畫布內
            this.x = Math.max(0, Math.min(window.innerWidth, this.x));
            this.y = Math.max(0, Math.min(window.innerHeight, this.y));
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.particleColor;
            ctx.fill();
        }
    }
    
    function initParticleBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        // 創建 canvas
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.background = 'transparent';
        // 插入到 hero 的第一個子元素之前，確保在背景遮罩下方
        hero.insertBefore(canvas, hero.firstChild);
        
        ctx = canvas.getContext('2d');
        
        // 設置畫布大小
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 創建粒子
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
        
        // 鼠標追蹤（可選）
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        // 動畫循環
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 更新和繪製粒子
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // 繪製連線
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * config.lineOpacity;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 121, 188, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticleBackground);
    } else {
        initParticleBackground();
    }
    
    // 清理函數
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
})();
