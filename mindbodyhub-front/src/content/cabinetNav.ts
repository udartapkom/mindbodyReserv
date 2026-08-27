import { IconName } from '@/shared/ui/Icon/types';
export type CabinetNavItem = {
    href: string;
    label: string;
    icon: IconName;
};

export const cabinetNavItems: CabinetNavItem[] = [
    { href: '/cabinet', label: 'Главная', icon: 'home' },
    { href: '/cabinet/materials', label: 'Материалы', icon: 'pencil' },
    { href: '/cabinet/quotes', label: 'Цитаты', icon: 'quote' },
    { href: '/cabinet/support', label: 'Поддержка', icon: 'headset' },
    { href: '/cabinet/insights', label: 'Инсайты', icon: 'brain' },
    { href: '/cabinet/profile', label: 'Профиль', icon: 'user' },
];
