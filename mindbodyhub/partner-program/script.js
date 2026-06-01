const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const toast = document.getElementById('toast');

const TELEGRAM_USERNAME = 'slex39';

const PARTNER_MESSAGE = encodeURIComponent('Здравствуйте! Я хочу стать партнёром MindBodyHub. Где мне взять мою уникальную партнёрскую ссылку?');

function showToast(message) {
    const toastMessage = toast.querySelector('span');
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

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