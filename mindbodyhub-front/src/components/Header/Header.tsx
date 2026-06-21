"use client";
import React, { useState, useEffect } from "react";
import styles from "./Header.module.scss";
import DesktopNavigation from "../DesktopNavigation/DesktopNavigation";
import MobileNavigation from "../MobileNavigation/MobileNavigation";
import HeaderLogo from "../HeaderLogo/HeaderLogo";
import { Icon } from "@/shared/ui/Icon";

function Header() {
    const [windowWidth, setWindowWidth] = useState<number | null >(null);
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        window.addEventListener("resize", () => {
            setWindowWidth(window.innerWidth);
        });
        return () => {
            window.removeEventListener("resize", () => {
                setWindowWidth(window.innerWidth);
            });
        };
    }, []);
  return (
    <header className={styles.header}>
        <div className={styles.header__container}>
            <HeaderLogo />
            {windowWidth && windowWidth > 1024 ? <DesktopNavigation /> : <MobileNavigation />}
            <button className={styles.header__button}>
                <Icon name="lock" variant="solid" />
                <p className={styles.header__buttonText}>Частный доступ</p>
            </button>
        </div>
 
    </header>
  );
}

export default Header;