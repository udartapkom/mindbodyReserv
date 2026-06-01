// ===== DOM Elements =====
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const toast = document.getElementById('toast');

const TELEGRAM_USERNAME = 'slex39';
const VK_BOT_LINK = 'https://vk.com/mindbodyhubpro';

// Сообщение для поддержки
const SUPPORT_MESSAGE = encodeURIComponent('Здравствуйте! У меня возникла проблема:');

function showToast(message) {
    const toastMessage = toast.querySelector('span');
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function redirectToTelegram() {
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${SUPPORT_MESSAGE}`, '_blank');
}

function redirectToVKBot() {
    window.open(VK_BOT_LINK, '_blank');
}

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

// ===== КНОПКИ ПОДДЕРЖКИ =====
document.getElementById('supportTelegramBtn')?.addEventListener('click', redirectToTelegram);
document.getElementById('supportVkBtn')?.addEventListener('click', redirectToVKBot);
document.getElementById('ctaSupportBtn')?.addEventListener('click', redirectToTelegram);

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// ===== CLOSE MOBILE MENU ON LINK CLICK =====
document.querySelectorAll('.mobile-menu__nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (burgerBtn) burgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});