import type { ContactFormCopy } from '@/types/ContactFormCopy';

export const contactFormCopy: Record<'home' | 'support', ContactFormCopy> = {
    home: {
        title: 'Напишите нам',
        paragraphs: [
            'Остались вопросы о платформе, тарифах или том, с чего начать? Расскажите — ответим лично и поможем разобраться.',
            'Оставьте контакты и свой вопрос в форме.',
            'Обычно отвечаем в течение рабочего дня. Конфиденциально и без навязчивых рассылок.',
        ],
        submitLabel: 'Отправить',
        questionPlaceholder: 'Ваш вопрос',
    },
    support: {
        title: 'Не нашли ответ?',
        paragraphs: [
            'Опишите ситуацию в форме — ответим лично в течение рабочего дня.',
            'Для срочных вопросов пишите в мессенджер — в Telegram обычно отвечаем за 15 минут.',
        ],
        submitLabel: 'Отправить вопрос',
        questionPlaceholder: 'Опишите проблему или вопрос',
    },
};
