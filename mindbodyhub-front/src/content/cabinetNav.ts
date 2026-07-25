import { IconName } from '@/shared/ui/Icon/types';
export type CabinetNavItem = {
    href: string;
    label: string;
    icon: IconName;
};

export const cabinetNavItems: CabinetNavItem[] = [
    { href: '/cabinet', label: 'Главная', icon: 'home' },
    { href: '/cabinet/courses', label: 'Статьи', icon: 'pencil' },
    { href: '/cabinet/support', label: 'Поддержка', icon: 'headset' },
    { href: '/cabinet/faq', label: 'Вопросы и ответы', icon: 'question' },
    { href: '/cabinet/profile', label: 'Профиль', icon: 'user' },
];
