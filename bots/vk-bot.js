const { VK, Keyboard } = require('vk-io');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');

dotenv.config();

const vk = new VK({
    token: process.env.VK_BOT_TOKEN
});

const ADMIN_ID = parseInt(process.env.ADMIN_ID);

// Ссылка на оплату Ozon
const OZON_PAY_LINK = 'https://finance.ozon.ru/apps/sbp/ozonbankpay/019e22a8-ff1e-7b5f-99fb-8ce06ccc61ff';

const getMskDate = (addMonths = 0, addDays = 0) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const msk = new Date(utc + (3600000 * 3));
    msk.setMonth(msk.getMonth() + addMonths);
    msk.setDate(msk.getDate() + addDays);
    const dd = String(msk.getDate()).padStart(2, '0');
    const mm = String(msk.getMonth() + 1).padStart(2, '0');
    const yyyy = msk.getFullYear();
    const HH = String(msk.getHours()).padStart(2, '0');
    const min = String(msk.getMinutes()).padStart(2, '0');
    return `${HH}:${min} ${dd}.${mm}.${yyyy}`;
};

const TARIFFS = {
    'Философия': {
        price: '99₽',
        period: 'неделя',
        addDays: 7,
        addMonths: 0,
        features: ['Доступ к мыслям и заметкам', 'Еженедельные инсайты', 'Закрытый Telegram-канал']
    },
    'Отношения': {
        price: '999₽',
        period: 'месяц',
        addDays: 0,
        addMonths: 1,
        features: ['Решение проблем в отношениях', 'Сексуальная психология', 'Преодоление стеснения', 'Личные границы']
    },
    'Бизнес': {
        price: '3000₽',
        period: 'месяц',
        addDays: 0,
        addMonths: 1,
        features: ['Ментальное здоровье', 'Психология бизнеса', 'Управление стрессом', 'Продуктивность и фокус', 'Личные консультации']
    }
};

// Функция для отправки сообщения с оплатой (QR-код и ссылка)
const sendPaymentMessage = async (context, tariffName) => {
    const tariff = TARIFFS[tariffName];
    
    // Ссылка на QR-код (локальный файл)
    const qrUrl = 'http://localhost:3000/qr-sbp.jpg';
    
    const message = `💳 *Оплата тарифа ${tariffName}*\n\n` +
        `💰 Сумма: ${tariff.price}\n\n` +
        `📱 *Отсканируйте QR-код или перейдите по ссылке:*\n` +
        `${OZON_PAY_LINK}\n\n` +
        `⚠️ *После оплаты обязательно нажмите кнопку «✅ Я оплатил(а)»*`;
    
    // Отправляем сообщение с кнопками
    await context.send(message, { keyboard: getPaymentKeyboard(tariffName) });
    
    // Отправляем изображение QR-кода отдельным сообщением
    try {
        const uploadUrl = await vk.upload.messagePhoto({
            source: require('fs').createReadStream(path.join(__dirname, 'qr-sbp.jpg')),
            peer_id: context.peerId
        });
        await context.sendPhotos(uploadUrl, { keyboard: getPaymentKeyboard(tariffName) });
    } catch (err) {
        console.error('Ошибка отправки QR-кода:', err.message);
        await context.send(`🔗 Прямая ссылка: ${OZON_PAY_LINK}`, { keyboard: getPaymentKeyboard(tariffName) });
    }
};

const getFullDescription = (tariffName) => {
    const order = ['Философия', 'Отношения', 'Бизнес'];
    const tariffIndex = order.indexOf(tariffName);
    let allFeatures = [];
    for (let i = 0; i <= tariffIndex; i++) {
        allFeatures = [...allFeatures, ...TARIFFS[order[i]].features];
    }
    const featureText = allFeatures.map(f => `🔹 ${f}`).join('\n');
    let text = `📦 *Тариф: ${tariffName}* (${TARIFFS[tariffName].price} / ${TARIFFS[tariffName].period})\n\n`;
    text += `*Что входит:*\n${featureText}`;
    if (tariffIndex > 0) {
        text += `\n\n*А также возможности прошлых тарифов:*\n🔹 ${order.slice(0, tariffIndex).join(', ')}`;
    }
    text += `\n\n👇 *Нажмите «Оплатить», чтобы получить реквизиты.*`;
    return text;
};

const tariffsInlineKeyboard = Keyboard.keyboard([
    [Keyboard.textButton({ label: '📖 Философия — 99₽/нед', color: 'secondary', payload: { action: 'info', tariff: 'Философия' } })],
    [Keyboard.textButton({ label: '❤️ Отношения & Секс — 999₽/мес', color: 'primary', payload: { action: 'info', tariff: 'Отношения' } })],
    [Keyboard.textButton({ label: '💼 Бизнес — 3000₽/мес', color: 'positive', payload: { action: 'info', tariff: 'Бизнес' } })],
    [Keyboard.textButton({ label: '🆘 Поддержка', color: 'secondary', payload: { action: 'support_request' } })]
]).inline();

const getInfoKeyboard = (tariffName) => Keyboard.keyboard([
    [Keyboard.textButton({ label: `💳 Оплатить ${TARIFFS[tariffName].price}`, color: 'primary', payload: { action: 'pay', tariff: tariffName } })],
    [Keyboard.textButton({ label: '🔙 Назад к тарифам', color: 'secondary', payload: { action: 'back' } })]
]).inline();

const getPaymentKeyboard = (tariffName) => Keyboard.keyboard([
    [Keyboard.textButton({ label: '✅ Я оплатил(а)', color: 'positive', payload: { action: 'paid', tariff: tariffName } })],
    [Keyboard.textButton({ label: '🔙 Назад к тарифам', color: 'secondary', payload: { action: 'back' } })]
]).inline();

const supportBackKeyboard = Keyboard.keyboard([
    [Keyboard.textButton({ label: '🔙 Назад к тарифам', color: 'secondary', payload: { action: 'back' } })]
]).inline();

const mainMenuKeyboard = Keyboard.keyboard([
    [Keyboard.textButton({ label: '🔘 Начать', color: 'primary' })]
]);

const userState = new Map();

vk.updates.on('message_new', async (context) => {
    if (context.isOutbox) return;
    
    const msg = context.text?.toLowerCase().trim() || '';
    const userId = context.senderId;
    const userName = `@id${userId}`;
    
    if (context.messagePayload) {
        const payload = context.messagePayload;
        
        if (payload.action === 'back') {
            userState.delete(userId);
            return context.send('👇 *Выберите тариф:*', { keyboard: tariffsInlineKeyboard });
        }
        
        if (payload.action === 'info') {
            return context.send(getFullDescription(payload.tariff), { keyboard: getInfoKeyboard(payload.tariff) });
        }
        
        if (payload.action === 'pay') {
            // Отправляем сообщение с оплатой (QR-код и ссылка)
            return sendPaymentMessage(context, payload.tariff);
        }

        if (payload.action === 'support_request') {
            userState.set(userId, 'awaiting_support');
            return context.send(
                `🛠 *Служба поддержки*\n\n` +
                `Пожалуйста, опишите вашу проблему в следующем сообщении. Мы свяжемся с вами в ближайшее время!`,
                { keyboard: supportBackKeyboard }
            );
        }
        
        if (payload.action === 'paid') {
            const tariff = TARIFFS[payload.tariff];
            const timeNow = getMskDate();
            
            await context.send(`✅ *Ваша оплата обрабатывается!*\n\nВ течение 1-2 часов я вышлю вам уникальную ссылку.`);
            
            await vk.api.messages.send({
                user_id: ADMIN_ID,
                message: `💰 *НОВАЯ ОПЛАТА*\n\n👤 Кто: ${userName}\n🆔 ID: ${userId}\n📦 Тариф: ${payload.tariff}\n🕒 Время: ${timeNow}\n\n➡️ Ответить:\nsend ${userId} ТЕКСТ`,
                random_id: Math.floor(Math.random() * 1000000)
            });
            return;
        }
    }
    
    if (userId === ADMIN_ID && msg.startsWith('send ')) {
        const parts = context.text.split(' ');
        const targetUser = parts[1];
        const messageText = parts.slice(2).join(' ');
        if (!targetUser || !messageText) {
            return context.send('❌ Формат: send ID СООБЩЕНИЕ');
        }
        try {
            await vk.api.messages.send({
                user_id: targetUser,
                message: `✉️ *ОТВЕТ ОТ АДМИНИСТРАЦИИ*\n\n${messageText}`,
                random_id: Math.floor(Math.random() * 1000000)
            });
            return context.send(`✅ Сообщение отправлено пользователю ${targetUser}`);
        } catch (e) {
            return context.send(`❌ Ошибка: ${e.message}`);
        }
    }

    if (userState.get(userId) === 'awaiting_support' && !context.messagePayload) {
        userState.delete(userId);
        await context.send(`✅ *Ваше сообщение отправлено!*\nОжидайте ответа от администратора.`, { keyboard: tariffsInlineKeyboard });
        return vk.api.messages.send({
            user_id: ADMIN_ID,
            message: `🆘 *ВОПРОС В ПОДДЕРЖКУ*\n\n👤 От: ${userName}\n🆔 ID: ${userId}\n\n💬 Текст:\n${context.text}\n\n➡️ Для ответа:\nsend ${userId} ВАШ_ОТВЕТ`,
            random_id: Math.floor(Math.random() * 1000000)
        });
    }
    
    if (msg === 'начать' || msg === '/start' || msg === 'привет' || msg === '🔘 начать') {
        userState.delete(userId);
        return context.send(
            `🌿 *Добро пожаловать в MindBodyHub!*\n\nПсихология здоровья и бизнеса.\n\n👇 *Выберите тариф:*`,
            { keyboard: tariffsInlineKeyboard }
        );
    }
    
    return context.send(`❓ Напишите *"Начать"* чтобы увидеть тарифы.`, { keyboard: mainMenuKeyboard });
});

// ============ ЕДИНЫЙ СЕРВЕР ДЛЯ МОДАЛКИ ============
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../modal-window')));

// Отдаём QR-код для бота
app.get('/qr-sbp.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'qr-sbp.jpg'));
});

app.post('/api/send-to-admin', async (req, res) => {
    const { tariffName, tariffPrice, contact } = req.body;
    
    const message = `🟢 НОВАЯ ОПЛАТА НА САЙТЕ\n\n📦 Тариф: ${tariffName}\n💰 Сумма: ${tariffPrice}₽\n📞 Контакт: ${contact}\n🕐 Время: ${new Date().toLocaleString('ru-RU')}`;
    
    const url = `https://api.vk.com/method/messages.send?access_token=${process.env.VK_BOT_TOKEN}&user_id=${process.env.ADMIN_ID}&message=${encodeURIComponent(message)}&random_id=${Date.now()}&v=5.199`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.response) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: data.error });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📱 Модалка: http://localhost:${PORT}`);
});

vk.updates.start().then(() => {
    console.log('✅ Бот MindBodyHub запущен');
}).catch(console.error);