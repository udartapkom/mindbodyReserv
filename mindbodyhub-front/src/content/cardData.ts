import { CardData } from "@/types/cardData";

export const cardData: CardData[] = [
    {
        image: '/images/brain.png',
        imageAlt: 'Философия и самопознание',
        title: 'Пробный',
        price: '99₽',
        period: '/ неделя',
        titleColor: '#B1AEAF',
        subTitle: 'Философия',
        description: ['Доступ к мыслям и заметкам', 'Еженедельные инсайты', 'Цитаты', 'Закрытый Telegram-канал']
    },
    {
        image: '/images/love.png',
        imageAlt: 'Отношения и сексуальная психология',
        title: 'Популярный',
        titleColor: '#3b82f6',
        price: '999₽',
        period: '/ месяц',
        subTitle: 'Отношения & секс',
        description: ['Решение проблем в отношениях', 'Сексуальная психология', 'Преодоление стеснения', 'Личные границы']
    },
    {
        image: '/images/business.png',
        imageAlt: 'Ментальное здоровье и психология бизнеса',
        title: 'VIP',
        price: '3000₽',
        period: '/ месяц',
        subTitle: 'Ментальные проблемы & бизнес',
        titleColor: '#FF6700',
        description: ['Ментальное здоровье', 'Психология бизнеса', 'Управление стрессом', 'Продуктивность и фокус', 'Личные консультации']
    }
];
