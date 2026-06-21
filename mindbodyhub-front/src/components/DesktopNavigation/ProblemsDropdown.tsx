"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { problems } from "@/content/problems";
import { Icon } from "@/shared/ui/Icon";
import styles from "./ProblemsDropdown.module.scss";

function ProblemsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <li
      ref={dropdownRef}
      className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={styles.dropdown__trigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Выбрать проблемы
        <Icon
          name="chevron-down"
          className={`${styles.dropdown__icon} ${isOpen ? styles.dropdown__iconOpen : ""}`}
        />
      </button>

      <ul className={styles.dropdown__menu} role="menu">
        {problems.map((problem) => (
          <li key={problem.id} role="none">
            <Link
              role="menuitem"
              className={styles.dropdown__link}
              href={`/problems/${problem.slug}`}
              onClick={() => setIsOpen(false)}
            >
              {problem.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default ProblemsDropdown;
