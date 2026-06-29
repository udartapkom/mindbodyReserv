"use client";
import React, { useState, useEffect } from "react";
import styles from "./Header.module.scss";
import DesktopNavigation from "../DesktopNavigation/DesktopNavigation";
import MobileNavigation from "../MobileNavigation/MobileNavigation";
import HeaderLogo from "../HeaderLogo/HeaderLogo";
import { Icon } from "@/shared/ui/Icon";
import { useRouter } from "next/navigation";

function Header() {
    const router = useRouter();
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
    const handleLogin = () => {
        router.push('/login');
    };
  return (
    <header className={styles.header}>
        <div className={styles.header__container}>
            <HeaderLogo />
            {windowWidth && windowWidth > 1024 ? <DesktopNavigation /> : <MobileNavigation />}
            <button className={styles.header__button} onClick={handleLogin}>
                <Icon name="lock" variant="solid" style={{ color: '#3b82f6' }} />
                <p className={styles.header__buttonText}>Личный кабинет</p>
            </button>
        </div>
 
    </header>
  );
}

export default Header;