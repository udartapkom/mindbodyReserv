'use client';
import Link from 'next/link';
import styles from './Header.module.scss';
import DesktopNavigation from '../DesktopNavigation/DesktopNavigation';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import HeaderLogo from '../HeaderLogo/HeaderLogo';
import { Icon } from '@/shared/ui/Icon';
import { useAuth } from '@/context/AuthContext';

function Header() {
    const { isAuthenticated, logout } = useAuth();
    return (
        <div className={styles.headerStack}>
            <header className={styles.header}>
                <div className={styles.header__container}>
                    <HeaderLogo />
                    <div className={styles.header__desktopNav}>
                        <DesktopNavigation />
                    </div>
                    {!isAuthenticated && (
                        <Link href="/login" className={styles.header__button}>
                            <Icon name="lock" variant="solid" style={{ color: '#3b82f6' }} />
                            <span className={styles.header__buttonText}>Войти</span>
                        </Link>
                    )}
                    {isAuthenticated && (
                        <button onClick={logout} className={styles.header__button}>
                            <Icon name="lock" variant="solid" style={{ color: '#3b82f6' }} />
                            <span className={styles.header__buttonText}>Выйти</span>
                        </button>
                    )}
                    <div className={styles.header__mobileNav}>
                        <MobileNavigation />
                    </div>
                </div>
            </header>
            <div className={styles.devBanner} role="status">
                <p className={styles.devBanner__text}>
                    Сайт находится в разработке. По всем вопросам обращайтесь в{' '}
                    <Link href="/support" className={styles.devBanner__link}>
                        техподдержку
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}

export default Header;
