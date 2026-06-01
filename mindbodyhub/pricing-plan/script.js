// ===== DOM Elements =====
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const toast = document.getElementById('toast');

// Контакты админа
const TELEGRAM_USERNAME = 'slex39';

// Модалка
const modal = document.getElementById('paymentModal');
const modalTariffTitle = document.getElementById('modalTariffTitle');
const showRequisitesBtn = document.getElementById('showRequisitesBtn');
const requisitesBlock = document.getElementById('requisitesBlock');
const copyCardBtnModal = document.getElementById('copyCardBtnModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const backFromModalBtn = document.getElementById('backFromModalBtn');
const paidConfirmBtn = document.getElementById('paidConfirmBtn');

// Поля контактов
const contactEmail = document.getElementById('contactEmail');
const contactVk = document.getElementById('contactVk');
const contactTelegram = document.getElementById('contactTelegram');
const contactOther = document.getElementById('contactOther');
const contactError = document.getElementById('contactError');

let currentTariff = { name: '', price: '' };

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

// ===== TOAST =====
function showToast(message) {
    if (!toast) return;
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== МОДАЛКА ОПЛАТЫ =====
document.querySelectorAll('.tariff-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentTariff.name = btn.getAttribute('data-tariff-name');
        currentTariff.price = btn.getAttribute('data-tariff');
        modalTariffTitle.textContent = `Тариф: ${currentTariff.name} (${currentTariff.price}₽)`;
        
        // Сброс полей
        contactEmail.value = '';
        contactVk.value = '';
        contactTelegram.value = '';
        contactOther.value = '';
        requisitesBlock.style.display = 'none';
        contactError.style.display = 'none';
        showRequisitesBtn.style.display = 'block';
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

showRequisitesBtn.addEventListener('click', () => {
    requisitesBlock.style.display = 'block';
    showRequisitesBtn.style.display = 'none';
});

copyCardBtnModal.addEventListener('click', () => {
    navigator.clipboard.writeText('2200702123889995');
    showToast('Номер карты скопирован');
});

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}
closeModalBtn.addEventListener('click', closeModal);
backFromModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

function getContactInfo() {
    if (contactEmail.value.trim()) return { type: 'email', value: contactEmail.value.trim() };
    if (contactVk.value.trim()) return { type: 'vk', value: contactVk.value.trim() };
    if (contactTelegram.value.trim()) return { type: 'telegram', value: contactTelegram.value.trim() };
    if (contactOther.value.trim()) return { type: 'other', value: contactOther.value.trim() };
    return null;
}

paidConfirmBtn.addEventListener('click', () => {
    const contact = getContactInfo();
    if (!contact) {
        contactError.style.display = 'block';
        return;
    }
    contactError.style.display = 'none';
    
    const message = `🟢 ОПЛАТА ТАРИФА\n\n👤 Пользователь запросил доступ к тарифу: ${currentTariff.name} (${currentTariff.price}₽)\n📬 Контакт для отправки ссылки: ${contact.type}: ${contact.value}`;
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('✅ Успешно! Ваш платёж в обработке. Ожидайте ссылку в выбранный канал связи.');
    closeModal();
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
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