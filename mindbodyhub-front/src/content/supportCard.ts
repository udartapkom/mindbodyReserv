import type { SupportCardProps } from '@/types/SupportCard';
import telegramIcon from '../../public/icons/telegram.svg';
import vkIcon from '../../public/icons/vk.svg';
import maxIcon from '../../public/icons/max.svg';

export type SupportLinkId = 'telegram' | 'vk' | 'max';

export type SupportLinks = Record<SupportLinkId, string>;

/** Если вдруг ссылки по api недоступны, используем эти ссылки */
export const DEFAULT_SUPPORT_LINKS: SupportLinks = {
  telegram: 'https://t.me/mbh_support',
  vk: 'https://vk.com/mindbodyhubpro',
  max: 'https://max.ru',
};

type SupportCardMeta = Omit<SupportCardProps[number], 'link'>;

export const supportCardMeta: SupportCardMeta[] = [
  {
    id: 'telegram',
    title: 'Telegram',
    description: 'Связь с поддержкой. Обычно отвечаем в течение 15 минут.',
    icon: telegramIcon,
    buttonText: 'Написать в Telegram',
  },
  {
    id: 'vk',
    title: 'ВКонтакте',
    description: 'Связь с поддержкой в сообщениях сообщества.',
    icon: vkIcon,
    buttonText: 'Написать в ВК',
  },
  {
    id: 'max',
    title: 'MAX',
    description: 'Напишите нам в мессенджере MAX.',
    icon: maxIcon,
    buttonText: 'Написать в MAX',
  },
];

export function buildSupportCards(links: SupportLinks = DEFAULT_SUPPORT_LINKS): SupportCardProps {
  return supportCardMeta.map((card) => ({
    ...card,
    link: links[card.id as SupportLinkId] ?? DEFAULT_SUPPORT_LINKS[card.id as SupportLinkId],
  }));
}

/** @deprecated Prefer buildSupportCards(links) with API data */
export const supportCard = buildSupportCards();
