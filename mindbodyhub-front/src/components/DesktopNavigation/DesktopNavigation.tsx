import Link from "next/link";
import styles from "./DesktopNavigation.module.scss";
import ProblemsDropdown from "./ProblemsDropdown";
import { useAuth } from "@/context/AuthContext";

function DesktopNavigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className={styles.desktopNavigation}>
      <ul className={styles.desktopNavigation__list}>
{/*         <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/">
            Главная
          </Link>
        </li> */}
        <li className={styles.desktopNavigation__item}>
        <Link className={styles.desktopNavigation__link} href="/instructions">
            База знаний
          </Link>
        </li>
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/price">
            Тарифы
          </Link>
        </li>
        <ProblemsDropdown />
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/about">
            О нас
          </Link>
        </li>
        <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/support">
            Поддержка
          </Link>
        </li>
        {isAuthenticated && (
          <li className={styles.desktopNavigation__item}>
          <Link className={styles.desktopNavigation__link} href="/cabinet">
            Кабинет
          </Link>
        </li>
        )}
      </ul>
    </nav>
  );
}

export default DesktopNavigation;
