// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    // ВАШ ID ВКОНТАКТЕ (сюда будут приходить сообщения от пользователей)
    ADMIN_VK_ID: '592703902',  // ← ВАШ ID! Убедитесь что он правильный
    
    VK_BOT_LINK: 'https://vk.com/mindbodyhubpro',
    OZON_PAY_LINK: 'https://finance.ozon.ru/apps/sbp/ozonbankpay/019e22a8-ff1e-7b5f-99fb-8ce06ccc61ff'
};

// DOM элементы
const modal = document.getElementById('paymentModal');
const closeModalBtn = document.getElementById('closeModal');
const backBtn = document.getElementById('backBtn');
const startPayBtn = document.getElementById('startPayBtn');
const paidBtn = document.getElementById('paidBtn');
const choiceBtns = document.querySelectorAll('.choice-btn');
const sitePaymentBlock = document.getElementById('sitePaymentBlock');
const paymentBlock = document.getElementById('paymentBlock');
const contactsArea = document.getElementById('contactsArea');

const contactEmail = document.getElementById('contactEmail');
const contactVk = document.getElementById('contactVk');
const contactError = document.getElementById('contactError');

const tariffNameSpan = document.getElementById('tariffName');
const copyOzonLinkBtn = document.getElementById('copyOzonLinkBtn');

const successBlock = document.getElementById('successBlock');
const successMessage = document.getElementById('successMessage');
const successTitle = document.getElementById('successTitle');
const problemSupportLink = document.getElementById('problemSupportLink');

// Переменные состояния
let currentPaymentMethod = null;
let currentTariff = { name: 'Философия', price: '99', period: 'неделя' };
let isLoading = false;

// Показать уведомление
function showToast(message, isError = false, duration = 3500) {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (isError) toast.style.background = '#EF4444';
    else toast.style.background = '#1E293B';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Показать загрузку
function showLoading(button) {
    isLoading = true;
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Отправка...';
    return () => {
        isLoading = false;
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Валидация
function validateContact(type, value) {
    if (!value || !value.trim()) return false;
    const val = value.trim();
    if (type === 'email') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
    if (type === 'vk') {
        return /^(https?:\/\/)?(www\.)?vk\.com\/|^id\d+$/.test(val);
    }
    return val.length >= 2;
}

// Получить контакт
function getContactInfo() {
    const email = contactEmail.value.trim();
    const vk = contactVk.value.trim();
    
    if (email && validateContact('email', email)) 
        return { type: 'Email', value: email, display: email };
    if (vk && validateContact('vk', vk)) 
        return { type: 'ВКонтакте', value: vk, display: vk };
    return null;
}

// Получить отображаемый контакт для поздравления
function getDisplayContact() {
    const email = contactEmail.value.trim();
    const vk = contactVk.value.trim();
    
    if (email && validateContact('email', email)) 
        return { type: 'email', value: email, label: 'на почту' };
    if (vk && validateContact('vk', vk)) 
        return { type: 'vk', value: vk, label: 'в ВК' };
    return null;
}

// Проверка заполнения
function isAnyContactFilled() {
    return getContactInfo() !== null;
}

// Проверка полей
function checkContactFields() {
    const filled = isAnyContactFilled();
    if (filled) {
        contactError.style.display = 'none';
        startPayBtn.disabled = false;
    } else {
        contactError.style.display = 'flex';
        startPayBtn.disabled = true;
    }
}

// ========== ОТПРАВКА УВЕДОМЛЕНИЯ В ВК (открывается чат с готовым сообщением) ==========
function notifyAdmin(contactInfo) {
    // Формируем сообщение для админа
    const message = `🟢 НОВАЯ ОПЛАТА НА САЙТЕ

📦 Тариф: ${currentTariff.name}
💰 Сумма: ${currentTariff.price}₽
📞 Контакт (${contactInfo.type}): ${contactInfo.display}
🕐 Время: ${new Date().toLocaleString('ru-RU')}

---
Пользователь оплатил тариф. Отправьте ему уникальную ссылку на этот контакт.`;
    
    // Кодируем сообщение для URL
    const encodedMessage = encodeURIComponent(message);
    
    // Открываем чат с админом с готовым текстом
    // ПОЛЬЗОВАТЕЛЬ УВИДИТ ЧАТ, НО ЕМУ НУЖНО БУДЕТ НАЖАТЬ "ОТПРАТИТЬ"
    const vkChatUrl = `https://vk.com/im?sel=${CONFIG.ADMIN_VK_ID}&text=${encodedMessage}`;
    
    // Открываем в новой вкладке
    window.open(vkChatUrl, '_blank');
    
    console.log('Открыт чат с админом, сообщение готово к отправке');
    return true;
}

// Показать блок поздравления
function showSuccessScreen(contactDisplay) {
    if (contactsArea) contactsArea.style.display = 'none';
    paymentBlock.style.display = 'none';
    startPayBtn.style.display = 'none';
    paidBtn.style.display = 'none';
    
    let contactHtml = `<span class="highlight-contact">${contactDisplay.value}</span>`;
    successMessage.innerHTML = `Поздравляем, ${contactHtml}!<br>На ${contactDisplay.label} отправлена уникальная ссылка на тариф <strong>${currentTariff.name}</strong>`;
    successTitle.textContent = 'Поздравляем!';
    successBlock.style.display = 'block';
}

// Открыть модалку
function openModal(tariffName, tariffPrice, tariffPeriod) {
    currentTariff = { name: tariffName, price: tariffPrice, period: tariffPeriod };
    tariffNameSpan.textContent = `${tariffName} — ${tariffPrice}₽ / ${tariffPeriod}`;
    resetModal();
    modal.classList.add('active');
}

// Сброс модалки
function resetModal() {
    currentPaymentMethod = null;
    choiceBtns.forEach(btn => btn.classList.remove('active'));
    sitePaymentBlock.style.display = 'none';
    paymentBlock.style.display = 'none';
    startPayBtn.disabled = true;
    startPayBtn.style.display = 'block';
    paidBtn.style.display = 'none';
    contactError.style.display = 'none';
    successBlock.style.display = 'none';
    
    if (contactsArea) contactsArea.style.display = 'block';
    
    contactEmail.value = '';
    contactVk.value = '';
    
    [contactEmail, contactVk].forEach(input => {
        if (input) input.style.borderColor = '#E2E8F0';
    });
}

// Закрыть модалку
function closeModal() {
    modal.classList.remove('active');
    resetModal();
}

// Копирование ссылки
if (copyOzonLinkBtn) {
    copyOzonLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(CONFIG.OZON_PAY_LINK);
        showToast('Ссылка на оплату скопирована');
    });
}

// Выбор способа оплаты
choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const method = btn.getAttribute('data-pay');
        currentPaymentMethod = method;
        choiceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (method === 'site') {
            sitePaymentBlock.style.display = 'block';
            paymentBlock.style.display = 'none';
            startPayBtn.style.display = 'block';
            paidBtn.style.display = 'none';
            successBlock.style.display = 'none';
            if (contactsArea) contactsArea.style.display = 'block';
            checkContactFields();
        } else if (method === 'vk') {
            window.open(CONFIG.VK_BOT_LINK, '_blank');
            showToast('Перейдите в ВК бот для оплаты');
            closeModal();
        }
    });
});

// Отслеживание ввода
[contactEmail, contactVk].forEach(input => {
    if (!input) return;
    input.addEventListener('input', checkContactFields);
    input.addEventListener('blur', function() {
        if (this.value.trim()) {
            const type = this.id.replace('contact', '').toLowerCase();
            const isValid = validateContact(type, this.value);
            if (!isValid) {
                showToast('Некорректный формат', true);
                this.style.borderColor = '#EF4444';
            } else {
                this.style.borderColor = '#10B981';
            }
        } else {
            this.style.borderColor = '#E2E8F0';
        }
    });
});

// Кнопка "Начать оплату"
startPayBtn.addEventListener('click', () => {
    if (!isAnyContactFilled()) {
        contactError.style.display = 'flex';
        return;
    }
    
    startPayBtn.style.display = 'none';
    paymentBlock.style.display = 'block';
    paidBtn.style.display = 'block';
    contactError.style.display = 'none';
    successBlock.style.display = 'none';
    
    showToast('Отсканируйте QR-код или перейдите по ссылке Ozon для оплаты');
});

// Кнопка "Я оплатил(а)" - ОТКРЫВАЕТ ЧАТ С АДМИНОМ С ГОТОВЫМ СООБЩЕНИЕМ
// Замени функцию paidBtn на эту:

paidBtn.addEventListener('click', async () => {
    if (isLoading) return;
    
    const contact = getContactInfo();
    if (!contact) {
        contactError.style.display = 'flex';
        return;
    }
    
    const resetLoading = showLoading(paidBtn);
    
    try {
        const response = await fetch('http://localhost:3000/api/send-to-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tariffName: currentTariff.name,
                tariffPrice: currentTariff.price,
                contact: contact.display
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const displayContact = getDisplayContact();
            if (displayContact) {
                showSuccessScreen(displayContact);
            } else {
                showToast('Ваш платёж успешно в обработке');
            }
        } else {
            showToast('Ошибка отправки уведомления', true);
        }
    } catch (error) {
        showToast('Ошибка соединения с сервером', true);
    }
    
    resetLoading();
});

// Поддержка
if (problemSupportLink) {
    problemSupportLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`https://vk.com/im?sel=${CONFIG.ADMIN_VK_ID}`, '_blank');
    });
}

// Закрытие
closeModalBtn.addEventListener('click', closeModal);
backBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Кнопки тарифов
document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tariffName = btn.getAttribute('data-tariff');
        const tariffPrice = btn.getAttribute('data-price');
        const tariffPeriod = btn.getAttribute('data-period');
        openModal(tariffName, tariffPrice, tariffPeriod);
    });
});

window.openPaymentModal = openModal;