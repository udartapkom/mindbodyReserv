export type AdminNavItem = {
  href: string;
  label: string;
  /** If omitted, visible to all staff (admin + editor) */
  roles?: Array<'admin' | 'editor'>;
};

export const adminNav: AdminNavItem[] = [
  { href: '/users', label: 'Пользователи' },
  { href: '/materials', label: 'Материалы' },
  { href: '/knowledge', label: 'База знаний' },
  { href: '/quotes', label: 'Цитаты' },
  { href: '/insights', label: 'Инсайты' },
  { href: '/tariffs', label: 'Тарифы', roles: ['admin'] },
  { href: '/tickets', label: 'Обращения' },
  { href: '/accounting', label: 'Бухгалтерия', roles: ['admin'] },
  { href: '/settings', label: 'Настройки', roles: ['admin'] },
  { href: '/system', label: 'Система', roles: ['admin'] },
  { href: '/db-status', label: 'Статус БД', roles: ['admin'] },
];

export function filterAdminNav(
  role: string | null | undefined,
): AdminNavItem[] {
  return adminNav.filter((item) => {
    if (!item.roles?.length) return true;
    return !!role && item.roles.includes(role as 'admin' | 'editor');
  });
}
