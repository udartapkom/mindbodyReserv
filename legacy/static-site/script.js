// ===== DOM Elements =====
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const animatedTitle = document.getElementById('animatedTitle');
const rotatingWord = document.getElementById('rotatingWord');

// ===== BURGER MENU =====
if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenu) {
        if (burgerBtn) burgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== HERO ANIMATION =====
const titlePhrases = ['Тебе нужны психологи?', 'Тебе нужны психиатры?', 'Тебе нужны мы.'];
let titleIndex = 0;
let isTitleAnimating = false;
let titleInterval;

function animateTitle() {
    if (isTitleAnimating) return;
    isTitleAnimating = true;
    animatedTitle.style.transition = 'opacity 0.4s ease';
    animatedTitle.style.opacity = '0';
    setTimeout(() => {
        titleIndex++;
        if (titleIndex < titlePhrases.length) {
            animatedTitle.textContent = titlePhrases[titleIndex];
        } else {
            animatedTitle.textContent = titlePhrases[titlePhrases.length - 1];
            clearInterval(titleInterval);
        }
        animatedTitle.style.opacity = '1';
        setTimeout(() => { isTitleAnimating = false; }, 200);
    }, 400);
}
titleInterval = setInterval(animateTitle, 2500);

const words = ['тебе', 'ей', 'ему', 'им', 'вам'];
let wordIndex = 0;
let isWordAnimating = false;

function animateWord() {
    if (isWordAnimating) return;
    isWordAnimating = true;
    rotatingWord.style.transition = 'opacity 0.3s ease';
    rotatingWord.style.opacity = '0';
    setTimeout(() => {
        wordIndex++;
        if (wordIndex < words.length) {
            rotatingWord.textContent = words[wordIndex];
        } else {
            wordIndex = 0;
            rotatingWord.textContent = words[0];
        }
        rotatingWord.style.opacity = '1';
        setTimeout(() => { isWordAnimating = false; }, 200);
    }, 300);
}
setInterval(animateWord, 2000);

// ===== ACCESS BLOCK (переход по уникальной ссылке) =====
const accessUrlInput = document.getElementById('accessUrlInput');
const accessUrlBtn = document.getElementById('accessUrlBtn');

if (accessUrlBtn && accessUrlInput) {
    accessUrlBtn.addEventListener('click', () => {
        let url = accessUrlInput.value.trim();
        if (!url) {
            alert('Введите ссылку доступа');
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        window.location.href = url;
    });
    accessUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') accessUrlBtn.click(); });
}

// ===== КНОПКИ "КУПИТЬ" — ЗАГЛУШКА ДЛЯ PLATEGA.IO =====
document.querySelectorAll('.tariff-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tariffName = btn.getAttribute('data-tariff-name');
        const tariffPrice = btn.getAttribute('data-tariff');
        // ЗАГЛУШКА: здесь будет интеграция с platega.io
        alert(`Оплата тарифа «${tariffName}» (${tariffPrice}₽)\n\nСистема оплаты будет подключена через platega.io`);
    });
});

// ===== CLOSE MOBILE MENU =====
document.querySelectorAll('.mobile-menu__nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (burgerBtn) burgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});