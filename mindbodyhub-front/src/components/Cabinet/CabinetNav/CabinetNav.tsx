'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cabinetNavItems } from '@/content/cabinetNav';
import styles from './CabinetNav.module.scss';
import { Icon } from '@/shared/ui/Icon';

function CabinetNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Навигация кабинета" className={styles.cabinetNav}>
            <ul className={styles.cabinetNav__list}>
                {cabinetNavItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/cabinet' && pathname.startsWith(item.href));

                    return (
                        <li key={item.href} className={styles.cabinetNav__item}>
                            <Icon 
                            name={item.icon} 
                            className={styles.cabinetNav__icon}/>
                            <Link className={styles.cabinetNav__link} href={item.href} aria-current={isActive ? 'page' : undefined}>
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default CabinetNav;
