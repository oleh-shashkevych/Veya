const burger = document.querySelector('.burger');
const nav = document.querySelector('.header__nav');
const headerWrapper = document.querySelector('.header');
const body = document.querySelector('body');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('active');
    headerWrapper.classList.toggle('active');
    body.classList.toggle('no-scroll');
});

// ======== КОД ДЛЯ ФІКСОВАНОЇ ШАПКИ ========

const header = document.querySelector('.header');

// Функція, яка буде додавати/видаляти клас
const handleHeaderScroll = () => {
    // Якщо сторінка прокручена більше ніж на 10px
    if (window.scrollY > 10) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
};

// Відслідковуємо подію скролу
window.addEventListener('scroll', handleHeaderScroll);

// Також перевіряємо стан при завантаженні сторінки (на випадок, якщо вона завантажилась не зверху)
document.addEventListener('DOMContentLoaded', handleHeaderScroll);

// ======== ОНОВЛЕНИЙ КОД ДЛЯ ХІРО СЕКЦІЇ ========

const heroImages = document.querySelectorAll('.hero__bg-img');
let currentImageIndex = 0;
let zCounter = 1; // Початковий z-index для наступної картинки (активна має z-index: 2)

function showNextImage() {
    if (heroImages.length === 0) return;

    // Скидаємо z-index, щоб уникнути нескінченного росту
    if (zCounter > heroImages.length + 1) {
        heroImages.forEach(img => img.style.zIndex = 1); // Скидаємо всім
        zCounter = 2; // Починаємо знову з 2
    }

    // Наступний індекс із зацикленням
    const nextImageIndex = (currentImageIndex + 1) % heroImages.length;
    const nextImage = heroImages[nextImageIndex];

    // Призначаємо новий z-index і робимо картинку активною
    nextImage.style.zIndex = zCounter++; // Призначаємо і потім збільшуємо
    nextImage.classList.add('active');

    // Попередню картинку робимо неактивною
    const currentImage = heroImages[currentImageIndex];
    currentImage.classList.remove('active');

    // Оновлюємо поточний індекс
    currentImageIndex = nextImageIndex;
}

if (window.innerWidth > 768) {
    if (heroImages.length > 1) {
        // Запускаємо зміну зображень кожні 6 секунд (6000 мс)
        // Час має бути трохи меншим за тривалість анімації transform (8с)
        setInterval(showNextImage, 4000);
    }
}

// ======== КОД ДЛЯ СЛАЙДЕРА "КОЛЕКЦІЇ" (ІДЕАЛЬНИЙ РИТМ) ========

if (document.querySelector('.collections-slider')) {
    const collectionsSlider = new Swiper('.collections-slider', {
        // Optional parameters
        loop: true,
        spaceBetween: 15,
        speed: 2500,
        slidesPerGroup: 1,
    
        // Конфігурація автопрокрутки
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
    
        // Pagination (точки)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    
        // Responsive breakpoints
        breakpoints: {
            320: { slidesPerView: 1, slidesPerGroup: 1 },
            576: { slidesPerView: 2, slidesPerGroup: 2 },
            992: { slidesPerView: 3, slidesPerGroup: 3 },
            1200: { slidesPerView: 4, slidesPerGroup: 4 }
        }
    });

    // Зупиняємо автопрокрутку одразу після ініціалізації
    collectionsSlider.autoplay.stop();
    
    // Знаходимо сам елемент слайдера для спостереження
    const sliderElement = document.querySelector('.collections-slider');
    
    // Створюємо спостерігача (Intersection Observer)
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Якщо елемент з'явився в зоні видимості
            if (entry.isIntersecting) {
                // ОНОВЛЕНО: Додаємо одноразовий слухач на подію завершення анімації
                collectionsSlider.once('slideChangeTransitionEnd', function () {
                    // Цей код спрацює, коли перша прокрутка закінчиться.
                    // Тепер запускаємо стандартну автопрокрутку.
                    collectionsSlider.autoplay.start();
                });
                
                // Запускаємо першу прокрутку негайно
                collectionsSlider.slideNext();
                
                // Припиняємо спостереження
                observer.unobserve(sliderElement);
            }
        });
    }, { threshold: 0.1 });
    
    // Починаємо спостереження за елементом слайдера
    observer.observe(sliderElement);
}


// ======== КОД ДЛЯ СЕКЦИИ "ПРО НАС" (POPUP) ========

// Находим все необходимые элементы
const gridImages = document.querySelectorAll('.about__grid-image');
const popup = document.querySelector('.popup');
const popupImg = document.querySelector('.popup__img');
const popupClose = document.querySelector('.popup__close');

if (popup) {
    // Функция для открытия попапа
    function openPopup(e) {
        popup.classList.add('active'); // Используем класс для показа
        popupImg.src = e.target.src;   // Устанавливаем картинку
        body.classList.add('no-scroll'); // Блокируем скролл фона
    }
    
    // Функция для закрытия попапа
    function closePopup() {
        popup.classList.remove('active'); // Скрываем попап
        body.classList.remove('no-scroll'); // Возвращаем скролл
    }
    
    // Добавляем обработчики событий
    gridImages.forEach(image => {
        image.addEventListener('click', openPopup);
    });
    
    popupClose.addEventListener('click', closePopup);
    
    // Закрытие по клику на оверлей (мимо картинки)
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup();
        }
    });
    
    // Закрытие по нажатию на клавишу Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closePopup();
        }
    });
}


// ======== КОД ДЛЯ СЕКЦІЇ "ЧАСТІ ЗАПИТАННЯ" (ACCORDION) ========

const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');

    question.addEventListener('click', () => {
        // Перевіряємо, чи активний поточний елемент
        const isActive = item.classList.contains('active');

        // Спочатку закриваємо всі відкриті елементи
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
        });

        // Якщо елемент не був активним, робимо його активним
        if (!isActive) {
            item.classList.add('active');
        }
        // Якщо він був активним, то після видалення класу вище він залишиться закритим
    });
});

// ======== НАДЕЖНЫЙ КОД ВЫРАВНИВАНИЯ ВЫСОТ ДЛЯ ВСЕХ БРАУЗЕРОВ ========

function alignAboutSectionHeights() {
    const textWrapper = document.querySelector('.about__text-wrapper'); 
    const imageGrid = document.querySelector('.about__image-grid');

    if (!textWrapper || !imageGrid) return;

    if (window.innerWidth > 992) {
        // Сначала сбрасываем высоту, чтобы браузер мог вычислить её заново
        imageGrid.style.height = 'auto';
        
        // Даем браузеру "вздохнуть" перед замером. Это ключевой фикс для Safari.
        requestAnimationFrame(() => {
            const contentHeight = textWrapper.offsetHeight;
            imageGrid.style.height = `${contentHeight}px`;
        });
    } else {
        imageGrid.style.height = 'auto';
    }
}

function alignCreativitySectionHeights() {
    const textWrapper = document.querySelector('.creativity__text-wrapper');
    const imageContentBlocks = document.querySelectorAll('.creativity__image-content');

    if (!textWrapper || imageContentBlocks.length === 0) return;

    if (window.innerWidth > 992) {
        // Даем браузеру "вздохнуть" перед замером
        requestAnimationFrame(() => {
            const totalHeight = textWrapper.offsetHeight;

            imageContentBlocks.forEach(block => {
                const imageWrap = block.querySelector('.creativity__image-wrap');
                const creativityText = block.querySelector('.creativity__text');
                const listenButton = block.querySelector('.creativity__listen');

                if (!imageWrap || !creativityText || !listenButton) return;

                const textStyles = window.getComputedStyle(creativityText);
                const buttonStyles = window.getComputedStyle(listenButton);

                const textHeight = creativityText.offsetHeight + parseFloat(textStyles.marginTop) + parseFloat(textStyles.marginBottom);
                const buttonHeight = listenButton.offsetHeight + parseFloat(buttonStyles.marginTop) + parseFloat(buttonStyles.marginBottom);
                
                const heightToSubtract = textHeight + buttonHeight;
                const finalImageHeight = totalHeight - heightToSubtract;
                
                imageWrap.style.height = `${Math.max(0, finalImageHeight)}px`;
            });
        });
    } else {
        imageContentBlocks.forEach(block => {
            const imageWrap = block.querySelector('.creativity__image-wrap');
            if (imageWrap) {
                imageWrap.style.height = 'auto';
            }
        });
    }
}

// --- ИЗМЕНЕННЫЙ БЛОК ЗАПУСКА ---

// Функция, которая запускает все расчеты
function runAllAlignments() {
    alignAboutSectionHeights();
    alignCreativitySectionHeights();
}

// 1. Используем window.onload. Это событие ждет загрузки ВСЕХ ресурсов (картинок, шрифтов и т.д.).
//    Это более надежно для скриптов, зависящих от размеров элементов.
window.addEventListener('load', runAllAlignments);

// 2. По-прежнему вызываем при изменении размера окна.
window.addEventListener('resize', runAllAlignments);


// ======== NEW: КОД ДЛЯ ФІЛЬТРАЦІЇ ТОВАРІВ НА СТОРІНЦІ МАГАЗИНУ ========
document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.querySelector('.filter-buttons');
    const productGrid = document.querySelector('.product-grid');

    // Перевіряємо, чи існують елементи на сторінці
    if (!filterContainer || !productGrid) {
        return;
    }

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const productCards = productGrid.querySelectorAll('.product-card');

    filterContainer.addEventListener('click', (event) => {
        const target = event.target;

        // Перевіряємо, чи клік був по кнопці фільтра
        if (!target.matches('.filter-btn')) {
            return;
        }

        const filterValue = target.getAttribute('data-filter');

        // Оновлюємо активний стан кнопок
        filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        target.classList.add('active');

        // Фільтруємо товари
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');

            if (filterValue === 'all' || filterValue === cardCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ======== NEW: КОД ДЛЯ СЛАЙДЕРА НА СТРАНИЦЕ ПРОДУКТА ========
// Проверяем, существует ли на странице элемент слайдера, чтобы избежать ошибок
if (document.querySelector('.product-gallery-slider')) {
    const productGallerySlider = new Swiper('.product-gallery-slider', {
        // Основные параметры
        loop: true, // Бесконечная прокрутка
        spaceBetween: 10,
        
        // Пагинация (точки)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
}
