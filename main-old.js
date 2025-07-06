class FullPageScroll {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 5;
        this.isScrolling = false;
        this.touchStartY = 0;
        this.touchEndY = 0;

        // Параметры для обработки тачпада
        this.wheelAccumulated = 0;
        this.wheelThreshold = 100; // Минимальное накопленное значение для переключения секции
        this.wheelTimeout = null;
        this.wheelResetDelay = 150; // Время в мс для сброса накопленного значения
        this.lastWheelTime = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSectionPositions();
        this.updateNavDots();
    }

    setupEventListeners() {
        // Mouse wheel с улучшенной обработкой тачпада
        document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Navigation dots
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetSection = parseInt(e.target.getAttribute('data-section'));
                this.goToSection(targetSection);
            });
        });
    }

    handleWheel(e) {
        if (this.isScrolling) {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        const currentTime = Date.now();
        const timeDelta = currentTime - this.lastWheelTime;
        this.lastWheelTime = currentTime;

        // Определяем тип устройства по характеристикам события
        const isTouchpad = this.detectTouchpad(e);

        if (isTouchpad) {
            this.handleTouchpadScroll(e, timeDelta);
        } else {
            // Обычная мышь - мгновенная реакция
            if (Math.abs(e.deltaY) > 10) { // Минимальный порог для мыши
                if (e.deltaY > 0) {
                    this.nextSection();
                } else {
                    this.prevSection();
                }
            }
        }
    }

    detectTouchpad(e) {
        // Эвристика для определения тачпада:
        // 1. Маленькие значения deltaY (обычно < 50 для тачпада, > 100 для мыши)
        // 2. Наличие дробных значений
        // 3. Частые события (wheelDeltaMode = 0 для тачпада)

        const hasSmallDelta = Math.abs(e.deltaY) < 50;
        const hasFractionalDelta = e.deltaY % 1 !== 0;
        const isDOMDeltaPixel = e.deltaMode === 0;

        return hasSmallDelta && (hasFractionalDelta || isDOMDeltaPixel);
    }

    handleTouchpadScroll(e, timeDelta) {
        // Сброс накопленного значения если прошло много времени
        if (timeDelta > this.wheelResetDelay) {
            this.wheelAccumulated = 0;
        }

        // Накапливаем значение скролла
        this.wheelAccumulated += e.deltaY;

        // Очищаем предыдущий таймаут
        if (this.wheelTimeout) {
            clearTimeout(this.wheelTimeout);
        }

        // Проверяем, достигли ли мы порога
        if (Math.abs(this.wheelAccumulated) >= this.wheelThreshold) {
            if (this.wheelAccumulated > 0) {
                this.nextSection();
            } else {
                this.prevSection();
            }
            this.wheelAccumulated = 0;
        } else {
            // Устанавливаем таймаут для сброса накопленного значения
            this.wheelTimeout = setTimeout(() => {
                this.wheelAccumulated = 0;
            }, this.wheelResetDelay);
        }
    }

    handleKeyboard(e) {
        if (this.isScrolling) return;

        switch (e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                this.nextSection();
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.prevSection();
                break;
            case ' ': // Space key
                // Проверяем, что фокус не на интерактивном элементе
                if (!this.isInteractiveElement(document.activeElement)) {
                    e.preventDefault();
                    this.nextSection();
                }
                break;
            case 'Home':
                e.preventDefault();
                this.goToSection(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSection(this.totalSections - 1);
                break;
        }
    }

    isInteractiveElement(element) {
        const interactiveTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'];
        return interactiveTags.includes(element.tagName) ||
            element.contentEditable === 'true' ||
            element.tabIndex >= 0;
    }

    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (this.isScrolling) return;

        this.touchEndY = e.changedTouches[0].clientY;
        const touchDiff = this.touchStartY - this.touchEndY;

        // Minimum swipe distance
        if (Math.abs(touchDiff) > 50) {
            if (touchDiff > 0) {
                this.nextSection();
            } else {
                this.prevSection();
            }
        }
    }

    nextSection() {
        if (this.currentSection < this.totalSections - 1) {
            this.currentSection++;
            this.updateSections();
        }
    }

    prevSection() {
        if (this.currentSection > 0) {
            this.currentSection--;
            this.updateSections();
        }
    }

    goToSection(sectionIndex) {
        if (sectionIndex >= 0 && sectionIndex < this.totalSections && sectionIndex !== this.currentSection) {
            this.currentSection = sectionIndex;
            this.updateSections();
        }
    }

    updateSections() {
        this.isScrolling = true;
        this.updateSectionPositions();
        this.updateNavDots();
        this.updateScrollIndicator();

        // Trigger collections animation when scrolling to section 2
        if (this.currentSection === 1) {
            if (typeof collectionsAnim !== 'undefined' && collectionsAnim) {
                collectionsAnim.triggerOnScroll();
            }
        }

        // Reset scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 800); // Animation duration
    }

    updateSectionPositions() {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            const offset = (index - this.currentSection) * 100;
            section.style.transform = `translateY(${offset}vh)`;
        });
    }

    updateNavDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSection);
        });
    }

    updateScrollIndicator() {
        const indicator = document.querySelector('.scroll-indicator');
        if (indicator) {
            if (this.currentSection === this.totalSections - 1) {
                indicator.style.display = 'none';
            } else {
                indicator.style.display = 'block';
            }
        }
    }

    // Метод для настройки чувствительности тачпада
    setTouchpadSensitivity(threshold = 100, resetDelay = 150) {
        this.wheelThreshold = threshold;
        this.wheelResetDelay = resetDelay;
    }

    // Метод для получения текущих настроек
    getTouchpadSettings() {
        return {
            threshold: this.wheelThreshold,
            resetDelay: this.wheelResetDelay
        };
    }
}

// Collections Animation Class
class CollectionsAnimation {
    constructor() {
        this.isAnimated = false;
        this.title = null;
        this.grid = null;
        this.initElements();
    }

    initElements() {
        // Check if elements exist before assigning
        this.title = document.querySelector('.collections-title');
        this.grid = document.querySelector('.collections-grid');
    }

    triggerOnScroll() {
        // This check ensures animation runs only when section 2 is active
        // and if it hasn't been animated yet (or if reset for re-animation)
        if (!this.isAnimated && this.grid) { // Ensure grid exists
            this.startAnimation();
        }
    }

    startAnimation() {
        this.resetAnimationState(); // Сбрасываем состояние элементов перед анимацией

        // Функция для планирования анимации элементов коллекции
        const scheduleItemAnimations = () => {
            if (this.grid) {
                const items = this.grid.querySelectorAll('.collection-item');
                items.forEach((item, index) => {
                    // Новая задержка между появлением каждого элемента: 100 мс
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 100);
                });
                this.isAnimated = true; // Помечаем, что анимация запущена
            }
        };

        // Анимация заголовка (если он есть)
        // Заголовок начнет исчезать через 1500 мс (как и раньше)
        if (this.title) {
            this.title.classList.remove('fade-out'); // Убедимся, что заголовок видим вначале
            setTimeout(() => {
                if (this.title) this.title.classList.add('fade-out');
            }, 1500); // Заголовок начинает исчезать через 1500 мс
        }

        // Запускаем анимацию появления элементов коллекции через 1500 мс после входа в секцию
        setTimeout(() => {
            scheduleItemAnimations();
        }, 1500); // Общая задержка перед началом появления первой коллекции
    }

    // Resets items to their initial hidden state and allows re-animation
    resetAnimationState() {
        if (this.title) {
            this.title.classList.remove('fade-out');
        }
        if (this.grid) {
            const items = this.grid.querySelectorAll('.collection-item');
            items.forEach(item => {
                item.classList.remove('visible');
            });
        }
        this.isAnimated = false; // Allow animation to be triggered again if logic permits
    }

    // This method can be called if you want the animation to replay every time the section is entered
    // (requires uncommenting collectionsAnim.resetOnLeave() in FullPageScroll class)
    resetOnLeave() {
        this.resetAnimationState();
    }
}

// Вспомогательная функция debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Image Slider Class
class ImageSlider {
    constructor() {
        this.debouncedResizeHandler = null;
        this.currentSlide = 0;
        this.previousSlide = -1;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.sliderDots = document.querySelectorAll('.slider-dot');
        this.isAutoPlaying = true;
        this.autoPlayInterval = null;
        this.isTextAnimating = false;

        this.dynamicTextListElement = document.querySelector('.hero-text-dynamic-list');
        this.dynamicTextItems = [];
        this.dynamicTexts = [
            "оберігають",
            "єднають",
            "надихають",
            "окриляють"
        ];

        if (this.totalSlides > 0 && this.dynamicTextListElement) {
            this.init();
        } else if (!this.dynamicTextListElement) {
            console.warn("Hero dynamic text list element not found!");
        }
    }

    init() {
        console.log('[ImageSlider] init() called');
        this.createDynamicTextItems();
        this.setupEventListeners();
        this.updateSlider(true, true);
        this.startAutoPlay();
        
        // No need for updateDynamicContainerWidth anymore since we set max width once
        console.log('[ImageSlider] init() completed. Current slide:', this.currentSlide);
    }

    createDynamicTextItems() {
        if (!this.dynamicTextListElement) {
            console.error("[ImageSlider] Cannot create dynamic text items, list element is null.");
            return;
        }
        this.dynamicTextListElement.innerHTML = '';
        this.dynamicTextItems = [];
        this.dynamicTexts.forEach((text) => {
            const listItem = document.createElement('li');
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            listItem.appendChild(textSpan);
            this.dynamicTextListElement.appendChild(listItem);
            this.dynamicTextItems.push(listItem);
        });
        
        // Set container to max width of all texts
        this.setMaxContainerWidth();
        console.log('[ImageSlider] Dynamic text items created:', this.dynamicTextItems.length);
    }

    setMaxContainerWidth() {
        if (!this.dynamicTextItems || this.dynamicTextItems.length === 0) return;
        
        let maxWidth = 0;
        const container = this.dynamicTextListElement.parentNode;
        
        // Temporarily make all items visible to measure their width
        this.dynamicTextItems.forEach((item, index) => {
            const textSpan = item.querySelector('span');
            if (textSpan) {
                // Temporarily show the item to measure it
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.style.position = 'static'; // Temporarily remove absolute positioning
                
                const textWidth = textSpan.offsetWidth;
                maxWidth = Math.max(maxWidth, textWidth);
                
                // Restore original styles
                item.style.opacity = '';
                item.style.transform = '';
                item.style.position = '';
            }
        });
        
        if (maxWidth > 0) {
            const padding = 10; // Small padding for safety
            container.style.width = (maxWidth + padding) + 'px';
            console.log(`[ImageSlider] Container width set to max: ${maxWidth + padding}px`);
        }
    }

    setupEventListeners() {
        const prevButton = document.querySelector('.section-1 .slider-nav .prev-btn');
        const nextButton = document.querySelector('.section-1 .slider-nav .next-btn');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.prevSlide();
                this.resetAutoPlay();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoPlay();
            });
        }

        this.sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoPlay();
            });
        });

        this.debouncedResizeHandler = debounce(() => {
            console.log('[ImageSlider] Window resized event triggered.');
            // Recalculate max width on resize since font sizes are responsive (vw units)
            this.setMaxContainerWidth();
        }, 250);

        window.addEventListener('resize', this.debouncedResizeHandler);
    }

    nextSlide() {
        if (this.isTextAnimating && this.totalSlides > 1) return;
        this.previousSlide = this.currentSlide;
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        if (this.isTextAnimating && this.totalSlides > 1) return;
        this.previousSlide = this.currentSlide;
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        if (this.isTextAnimating && this.totalSlides > 1) return;
        if (index >= 0 && index < this.totalSlides && index !== this.currentSlide) {
            this.previousSlide = this.currentSlide;
            this.currentSlide = index;
            this.updateSlider();
        }
    }

    updateDynamicContainerWidth(activeLiElement) {
        if (!activeLiElement || !this.dynamicTextListElement) {
            console.warn("[ImageSlider] Cannot update container width, activeLiElement or listElement missing.");
            return;
        }

        const textSpan = activeLiElement.querySelector('span');
        if (textSpan) {
            const textWidth = textSpan.offsetWidth;
            console.log(`[ImageSlider] Measured textSpan width: ${textWidth}px for text "${textSpan.textContent}"`);

            if (textWidth > 0) {
                const container = this.dynamicTextListElement.parentNode;
                const padding = 5;
                container.style.width = (textWidth + padding * 2) + 'px';
                console.log(`[ImageSlider] Dynamic container width set to: ${(textWidth + padding * 2)}px`);
            }
        } else {
            console.warn("[ImageSlider] textSpan not found in activeLiElement.");
        }
    }

    updateSlider(isInitialImage = false, isInitialText = false) {
        if (this.isTextAnimating && !isInitialText && this.totalSlides > 1) return;

        this.isTextAnimating = true;

        // Update image slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update slider dots
        this.sliderDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        // Simplified fade animation for dynamic text
        if (this.dynamicTextItems && this.dynamicTextItems.length > 0) {
            // Remove active class from all items first
            this.dynamicTextItems.forEach(item => {
                item.classList.remove('active', 'exiting');
            });
            
            const currentActiveLi = this.dynamicTextItems[this.currentSlide];
            if (currentActiveLi) {
                if (isInitialText || this.previousSlide === -1 || this.previousSlide === this.currentSlide) {
                    // Initial load or no previous slide
                    currentActiveLi.classList.add('active');
                    this.isTextAnimating = false;
                } else {
                    // Fade transition
                    setTimeout(() => {
                        if (currentActiveLi) {
                            currentActiveLi.classList.add('active');
                        }
                        
                        setTimeout(() => {
                            this.isTextAnimating = false;
                        }, 300); // Shorter delay since we're just fading
                    }, 0);
                }
            } else {
                this.isTextAnimating = false;
            }
        } else {
            this.isTextAnimating = false;
        }
        
        if (isInitialImage) this.previousSlide = this.currentSlide;
    }

    startAutoPlay() {
        if (this.isAutoPlaying && window.innerWidth > 768 && this.totalSlides > 1) {
            this.pauseAutoPlay();
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, 6000); // Faster interval for demo
        }
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }
}

class VideoSwiper {
    constructor() {
        this.swiperElement = document.querySelector('.video-swiper');
        if (!this.swiperElement) return;

        this.currentIndex = 1; // Средний элемент активен по умолчанию
        this.videos = Array.from(this.swiperElement.querySelectorAll('.video-container')); // Преобразуем в массив для удобства
        this.totalVideos = this.videos.length;

        // Убедимся, что общее количество видео равно 3 для этой логики
        if (this.totalVideos !== 3) {
            console.warn("VideoSwiper logic with flex order is designed for exactly 3 videos.");
            // Можно либо остановить инициализацию, либо использовать старую логику
            // return; 
        }

        this.dots = document.querySelectorAll('.section-4 .swiper-indicators .swiper-dot');
        this.isTransitioning = false;

        if (this.totalVideos === 0) return;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSwiper(); // Первоначальное обновление для установки порядка и классов
    }

    setupEventListeners() {
        const prevButton = document.querySelector('.section-4 .swiper-navigation .prev-btn');
        const nextButton = document.querySelector('.section-4 .swiper-navigation .next-btn');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.prevVideo());
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextVideo());
        }

        this.dots.forEach((dot) => { // dot's index from DOM will match video's original index if data-index is not used for dot association
            const dotIndex = parseInt(dot.getAttribute('data-index'));
            dot.addEventListener('click', () => this.goToVideo(dotIndex));
        });

        this.videos.forEach((videoContainer) => {
            const videoIndex = parseInt(videoContainer.getAttribute('data-index'));
            videoContainer.addEventListener('click', () => {
                if (videoIndex !== this.currentIndex) {
                    this.goToVideo(videoIndex);
                }
            });
        });

        let startX = 0;
        let startY = 0;

        this.swiperElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.swiperElement.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = startX - endX;
            const deltaY = startY - endY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) { // Min swipe distance
                if (deltaX > 0) {
                    this.nextVideo();
                } else {
                    this.prevVideo();
                }
            }
        });
    }

    nextVideo() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex + 1) % this.totalVideos;
        this.updateSwiper();
    }

    prevVideo() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex - 1 + this.totalVideos) % this.totalVideos;
        this.updateSwiper();
    }

    goToVideo(index) {
        if (this.isTransitioning || index === this.currentIndex || index < 0 || index >= this.totalVideos) return;
        this.currentIndex = index;
        this.updateSwiper();
    }

    updateSwiper() {
        this.isTransitioning = true;

        const activeDataIndexToFind = this.currentIndex;
        const prevDataIndexToFind = (this.currentIndex - 1 + this.totalVideos) % this.totalVideos;
        const nextDataIndexToFind = (this.currentIndex + 1) % this.totalVideos;

        this.videos.forEach((container) => {
            const containerDataIndex = parseInt(container.getAttribute('data-index'));

            container.classList.remove('is-center-slot', 'is-left-slot', 'is-right-slot');

            // Просто назначаем классы для анимации CSS.
            // Логику play/pause убираем.
            if (containerDataIndex === activeDataIndexToFind) {
                container.classList.add('is-center-slot');
            } else if (containerDataIndex === prevDataIndexToFind) {
                container.classList.add('is-left-slot');
            } else if (containerDataIndex === nextDataIndexToFind) {
                container.classList.add('is-right-slot');
            }
        });

        // Обновляем активную точку (этот код остается)
        this.dots.forEach((dot) => {
            const dotDataIndex = parseInt(dot.getAttribute('data-index'));
            dot.classList.toggle('active', dotDataIndex === this.currentIndex);
        });

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600); 
    }
}


// Global variables
let fullPageScroll;
let collectionsAnim;
let imageSlider;
let videoSwiper;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fullPageScroll = new FullPageScroll();
    // Only initialize animations/sliders if their respective sections/elements exist
    if (document.querySelector('.collections-container')) {
        collectionsAnim = new CollectionsAnimation();
    }
    if (document.querySelector('.slider-container')) {
        imageSlider = new ImageSlider();
    }
    if (document.querySelector('.video-swiper')) {
        videoSwiper = new VideoSwiper();
    }

    const burgerMenu = document.getElementById('burgerMenu');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // Handle scroll for header background
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    function closeMenu() {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }

    burgerMenu.addEventListener('click', toggleMenu);

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});

window.addEventListener('scroll', (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
});