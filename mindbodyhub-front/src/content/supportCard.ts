import type { SupportCardProps } from '@/types/SupportCard';
import telegramIcon from '../../public/icons/telegram.svg';
import vkIcon from '../../public/icons/vk.svg';
import maxIcon from '../../public/icons/max.svg';

export const supportCard: SupportCardProps = [
    {
        id: 'telegram',
        title: 'Telegram',
        description: 'Связь с поддержкой. Обычно отвечаем в течение 15 минут.',
        icon: telegramIcon,
        buttonText: 'Написать в Telegram',
        link: 'https://t.me/mbh_support',
    },
    {
        id: 'vk',
        title: 'ВКонтакте',
        description: 'Связь с поддержкой в сообщениях сообщества.',
        icon: vkIcon,
        buttonText: 'Написать в ВК',
        link: 'https://vk.com/mindbodyhubpro',
    },
    {
        id: 'max',
        title: 'MAX',
        description: 'Напишите нам в мессенджере MAX.',
        icon: maxIcon,
        buttonText: 'Написать в MAX',
        link: 'https://max.com/mbh_support',
    },
];
