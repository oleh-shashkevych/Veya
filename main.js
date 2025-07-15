
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

// ======== КОД ДЛЯ ВЫРАВНИВАНИЯ ВЫСОТЫ БЛОКОВ "ПРО НАС" (ИЗМЕРЕНИЕ КОНТЕНТА) ========

function alignAboutSectionHeights() {
    // Находим обертку с контентом и блок с картинками
    const textWrapper = document.querySelector('.about__text-wrapper'); 
    const imageGrid = document.querySelector('.about__image-grid');

    // Проверяем, что оба элемента существуют
    if (!textWrapper || !imageGrid) {
        return;
    }

    // Скрипт работает только на десктопах (шире 992px)
    if (window.innerWidth > 992) {
        // Сбрасываем высоту грида с картинками на авто, чтобы избежать влияния старых расчетов
        imageGrid.style.height = 'auto';

        // Получаем точную высоту обертки с контентом
        const contentHeight = textWrapper.offsetHeight;

        // Применяем эту высоту к блоку с изображениями
        imageGrid.style.height = `${contentHeight}px`;
    } else {
        // На мобильных устройствах сбрасываем стили высоты
        imageGrid.style.height = 'auto';
    }
}

// Вызываем функцию при загрузке страницы и изменении размера окна
document.addEventListener('DOMContentLoaded', alignAboutSectionHeights);
window.addEventListener('resize', alignAboutSectionHeights);

// ======== КОД ДЛЯ ВЫРАВНИВАНИЯ ВЫСОТЫ В СЕКЦИИ "ТВОРЧІСТЬ" (С ВЫЧИТАНИЕМ) ========

function alignCreativitySectionHeights() {
    // Находим левый блок для измерения общей высоты
    const textWrapper = document.querySelector('.creativity__text-wrapper');
    // Находим родительские контейнеры для каждого из трех правых блоков
    const imageContentBlocks = document.querySelectorAll('.creativity__image-content');

    if (!textWrapper || imageContentBlocks.length === 0) {
        return;
    }

    if (window.innerWidth > 992) {
        // 1. Получаем общую высоту, на которую нужно ориентироваться
        const totalHeight = textWrapper.offsetHeight;

        // 2. Проходимся по каждому из трех блоков справа
        imageContentBlocks.forEach(block => {
            const imageWrap = block.querySelector('.creativity__image-wrap');
            const creativityText = block.querySelector('.creativity__text');
            const listenButton = block.querySelector('.creativity__listen');

            if (!imageWrap || !creativityText || !listenButton) {
                return;
            }

            // 3. Считаем высоту элементов, которые нужно вычесть
            const textStyles = window.getComputedStyle(creativityText);
            const buttonStyles = window.getComputedStyle(listenButton);

            const textHeight = creativityText.offsetHeight + parseFloat(textStyles.marginTop) + parseFloat(textStyles.marginBottom);
            const buttonHeight = listenButton.offsetHeight + parseFloat(buttonStyles.marginTop) + parseFloat(buttonStyles.marginBottom);
            
            const heightToSubtract = textHeight + buttonHeight;

            // 4. Вычисляем и применяем итоговую высоту для блока с картинкой
            const finalImageHeight = totalHeight - heightToSubtract;
            
            // Убедимся, что высота не отрицательная
            imageWrap.style.height = `${Math.max(0, finalImageHeight)}px`;
        });

    } else {
        // На мобильных сбрасываем все высоты
        imageContentBlocks.forEach(block => {
            const imageWrap = block.querySelector('.creativity__image-wrap');
            if (imageWrap) {
                imageWrap.style.height = 'auto';
            }
        });
    }
}

// Вызываем функцию при загрузке и ресайзе
document.addEventListener('DOMContentLoaded', alignCreativitySectionHeights);
window.addEventListener('resize', alignCreativitySectionHeights);