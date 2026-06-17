const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

const TELEGRAM_USERNAME = 'mbh_support';

// Сообщение для партнёров
const PARTNER_MESSAGE = encodeURIComponent('Здравствуйте! Я хочу стать партнёром MindBodyHub! Что от меня требуется?');

function redirectToTelegram() {
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${PARTNER_MESSAGE}`, '_blank');
}

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
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Все кнопки ведут в Telegram с одним сообщением
const partnerButtons = ['becomePartnerBtn', 'ctaTelegramBtn', 'finalCtaBtn'];
partnerButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', redirectToTelegram);
    }
});

// Кнопка "Узнать больше" в статусе
const statusMoreLink = document.getElementById('statusMoreLink');
if (statusMoreLink) {
    statusMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent('Здравствуйте! Хочу узнать подробнее о статусе партнёра.')}`, '_blank');
    });
}

document.getElementById('learnMoreBtn')?.addEventListener('click', () => {
    document.getElementById('howItWorks')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

document.querySelectorAll('.mobile-menu__nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (burgerBtn) burgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});