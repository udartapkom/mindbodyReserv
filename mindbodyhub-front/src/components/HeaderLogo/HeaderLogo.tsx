import React from "react";
import Image from "next/image";
import logo from "../../../public/icons/brain.svg";
import styles from "./HeaderLogo.module.scss";

function HeaderLogo() {
  return <div className={styles.headerLogo}>
    <Image src={logo} alt="HeaderLogo" width={32} height={32} />
    <span className={styles.headerLogo__text}>MindBodyHub</span>
    </div>;
}

export default HeaderLogo;