import React from "react";
import Image from "next/image";
import logo from "../../../public/icons/icon.svg";
import styles from "./HeaderLogo.module.scss";
import Link from "next/link";

function HeaderLogo() {
  return (
    <Link href="/" className={styles.headerLogo}>
      <Image src={logo} alt="MindBodyHub" width={44} height={44} />
      <span className={styles.headerLogo__text}>MindBodyHub</span>
    </Link>
  )
}

export default HeaderLogo;