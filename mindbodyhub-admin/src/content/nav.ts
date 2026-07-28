export type AdminNavItem = {
  href: string;
  label: string;
};

export const adminNav: AdminNavItem[] = [
  { href: '/users', label: 'Пользователи' },
  { href: '/materials', label: 'Материалы' },
  { href: '/knowledge', label: 'База знаний' },
  { href: '/quotes', label: 'Цитаты' },
  { href: '/tariffs', label: 'Тарифы' },
  { href: '/tickets', label: 'Обращения' },
  { href: '/accounting', label: 'Бухгалтерия' },
  { href: '/settings', label: 'Настройки' },
];
