
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.header__nav');
    const body = document.querySelector('body');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('no-scroll');
    });

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
       setInterval(showNextImage, 6000);
    }
}

// ======== КОД ДЛЯ СЛАЙДЕРА "КОЛЕКЦІЇ" ========

const collectionsSlider = new Swiper('.collections-slider', {
    // Optional parameters
    loop: true,
    spaceBetween: 15,
    speed: 1500,

    // Autoplay configuration
    autoplay: {
        delay: 6000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },

    // Pagination (точки)
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    // --- ДОБАВЛЕНО ---
    // Устанавливаем группировку по умолчанию.
    slidesPerGroup: 1,
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---

    // Responsive breakpoints
    breakpoints: {
        // when window width is >= 320px
        320: {
            slidesPerView: 1,
            spaceBetween: 15,
            slidesPerGroup: 1 // Прокрутка по 1
        },
        // when window width is >= 576px
        576: {
            slidesPerView: 2,
            spaceBetween: 15,
            slidesPerGroup: 2 // Прокрутка по 2
        },
        // when window width is >= 992px
        992: {
            slidesPerView: 3,
            spaceBetween: 15,
            slidesPerGroup: 3 // Прокрутка по 3
        },
        // when window width is >= 1200px
        1200: {
            slidesPerView: 4,
            spaceBetween: 15,
            slidesPerGroup: 4 // Прокрутка по 4
        }
    }
});

// ======== КОД ДЛЯ СЕКЦИИ "ПРО НАС" (POPUP) ========

// Находим все необходимые элементы
const gridImages = document.querySelectorAll('.about__grid-image');
const popup = document.querySelector('.popup');
const popupImg = document.querySelector('.popup__img');
const popupClose = document.querySelector('.popup__close');

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