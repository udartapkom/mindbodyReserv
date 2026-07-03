"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { problems } from "@/content/problems";
import { Icon } from "@/shared/ui/Icon";
import styles from "./MobileNavigation.module.scss";

function MobileNavigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProblemsOpen, setIsProblemsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
        setIsProblemsOpen(false);
    };

    const toggleMenu = () => {
        if (isOpen) {
            closeMenu();
            return;
        }

        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;

        const scrollY = window.scrollY;
        document.body.dataset.scrollY = String(scrollY);
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            const savedScrollY = Number(document.body.dataset.scrollY ?? 0);
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            delete document.body.dataset.scrollY;
            window.scrollTo(0, savedScrollY);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <nav className={styles.mobileNavigation} aria-label="Мобильная навигация">
            <button
                type="button"
                className={`${styles.mobileNavigation__burger} ${isOpen ? styles.mobileNavigation__burger_open : ""}`}
                aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-panel"
                onClick={toggleMenu}
            >
                <span />
                <span />
                <span />
            </button>

            <div
                className={`${styles.mobileNavigation__overlay} ${isOpen ? styles.mobileNavigation__overlay_open : ""}`}
                aria-hidden={!isOpen}
                onClick={closeMenu}
            />

            <aside
                id="mobile-navigation-panel"
                className={`${styles.mobileNavigation__panel} ${isOpen ? styles.mobileNavigation__panel_open : ""}`}
                aria-hidden={!isOpen}
                inert={!isOpen ? true : undefined}
            >
                <div className={styles.mobileNavigation__content}>
                    <ul className={styles.mobileNavigation__list}>
                    <li className={styles.mobileNavigation__item}>
                        <Link
                            className={styles.mobileNavigation__link}
                            href="/"
                            onClick={closeMenu}
                        >
                            Главная
                        </Link>
                    </li>
                    <li className={styles.mobileNavigation__item}>
                        <Link
                            className={styles.mobileNavigation__link}
                            href="/instructions"
                            onClick={closeMenu}
                        >
                            Как это работает
                        </Link>
                    </li>
                    <li className={styles.mobileNavigation__item}>
                        <button
                            type="button"
                            className={styles.mobileNavigation__problemsTrigger}
                            aria-expanded={isProblemsOpen}
                            onClick={() => setIsProblemsOpen((prev) => !prev)}
                        >
                            Готовые решения
                            <Icon
                                name="chevron-down"
                                className={`${styles.mobileNavigation__problemsIcon} ${isProblemsOpen ? styles.mobileNavigation__problemsIcon_open : ""}`}
                            />
                        </button>
                        <ul
                            className={`${styles.mobileNavigation__subList} ${isProblemsOpen ? styles.mobileNavigation__subList_open : ""}`}
                        >
                            {problems.map((problem) => (
                                <li key={problem.id}>
                                    <Link
                                        className={styles.mobileNavigation__subLink}
                                        href={`/problems/${problem.slug}`}
                                        onClick={closeMenu}
                                    >
                                        {problem.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className={styles.mobileNavigation__item}>
                        <Link
                            className={styles.mobileNavigation__link}
                            href="/price"
                            onClick={closeMenu}
                        >
                            Тарифы
                        </Link>
                    </li>
                    <li className={styles.mobileNavigation__item}>
                        <Link
                            className={styles.mobileNavigation__link}
                            href="/about"
                            onClick={closeMenu}
                        >
                            О нас
                        </Link>
                    </li>
                    <li className={styles.mobileNavigation__item}>
                        <Link
                            className={styles.mobileNavigation__link}
                            href="/support"
                            onClick={closeMenu}
                        >
                            Поддержка
                        </Link>
                    </li>
                    </ul>
                </div>

                <div className={styles.mobileNavigation__footer}>
                    <Link
                        href="/login"
                        className={styles.mobileNavigation__loginButton}
                        onClick={closeMenu}
                    >
                        <Icon name="lock" variant="solid" />
                        Личный кабинет
                    </Link>
                </div>
            </aside>
        </nav>
    );
}

export default MobileNavigation;
