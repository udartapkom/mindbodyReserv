import Link from "next/link";
import styles from "./DesktopNavigation.module.scss";
import ProblemsDropdown from "./ProblemsDropdown";

function DesktopNavigation() {
  return (
    <nav className={styles.desktopNavigation}>
      <ul className={styles.desktopNavigation__list}>
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/">
            Главная
          </Link>
        </li>
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/support">
            Поддержка
          </Link>
        </li>
        <ProblemsDropdown />
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/about">
            О нас
          </Link>
        </li>
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/partners">
            Партнёрам
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default DesktopNavigation;
