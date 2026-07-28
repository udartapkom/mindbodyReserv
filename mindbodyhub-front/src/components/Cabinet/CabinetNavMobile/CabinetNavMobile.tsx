'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cabinetNavItems } from '@/content/cabinetNav';
import { Icon } from '@/shared/ui/Icon';
import styles from './CabinetNavMobile.module.scss';

const shortLabels: Record<string, string> = {
  '/cabinet': 'Главная',
  '/cabinet/materials': 'Материалы',
  '/cabinet/support': 'Помощь',
  '/cabinet/faq': 'FAQ',
  '/cabinet/profile': 'Профиль',
};

function CabinetNavMobile() {
  const pathname = usePathname();

  return (
    <nav aria-label="Навигация кабинета" className={styles.cabinetNavMobile}>
      <ul className={styles.cabinetNavMobile__list}>
        {cabinetNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/cabinet' && pathname.startsWith(item.href));

          return (
            <li key={item.href} className={styles.cabinetNavMobile__item}>
              <Link
                href={item.href}
                className={[
                  styles.cabinetNavMobile__link,
                  isActive ? styles.cabinetNavMobile__link_active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon name={item.icon} className={styles.cabinetNavMobile__icon} />
                <span className={styles.cabinetNavMobile__label}>
                  {shortLabels[item.href] ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default CabinetNavMobile;
