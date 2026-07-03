import Link from 'next/link';
import styles from './Header.module.scss';
import DesktopNavigation from '../DesktopNavigation/DesktopNavigation';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import HeaderLogo from '../HeaderLogo/HeaderLogo';
import { Icon } from '@/shared/ui/Icon';

function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.header__container}>
                <HeaderLogo />
                <div className={styles.header__desktopNav}>
                    <DesktopNavigation />
                </div>
                <Link href="/login" className={styles.header__button}>
                    <Icon name="lock" variant="solid" style={{ color: '#3b82f6' }} />
                    <span className={styles.header__buttonText}>Кабинет</span>
                </Link>
                <div className={styles.header__mobileNav}>
                    <MobileNavigation />
                </div>
           </div>
        </header>
    );
}

export default Header;
