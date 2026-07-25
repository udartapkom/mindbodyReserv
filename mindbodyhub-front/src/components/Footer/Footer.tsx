import styles from "./Footer.module.scss";
import HeaderLogo from "../HeaderLogo/HeaderLogo";
import Link from "next/link";

type FooterProps = {
    className?: string;
};

function Footer({ className }: FooterProps) {
    return (
        <footer className={[styles.footer, className].filter(Boolean).join(" ")}>
            <div className={styles.footer__container}>
                <div className={styles.footer__logo}>
                    <HeaderLogo />
                    <p className={styles.footer__logoText}>Психология здоровья и бизнеса</p>
                </div>
                <p className={styles.footer__copyright}>© 2026 MindBodyHub. Все права защищены.</p>
            </div>
            <div className={styles.footer__line}></div>
            <div className={styles.footer__links}>
                <Link className={styles.footer__link} href="/privacy">Политика конфиденциальности</Link>
                <span>|</span>
                <Link className={styles.footer__link} href="/terms">Пользовательское соглашение</Link>
                <span>|</span>
                <Link className={styles.footer__link} href="/support">Техподдержка</Link>
            </div>
        </footer>
    );
}

export default Footer;
