"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePublicMaterials } from "@/hooks/usePublicMaterials";
import { Icon } from "@/shared/ui/Icon";
import styles from "./ProblemsDropdown.module.scss";

function ProblemsDropdown() {
  const { materials, isLoading } = usePublicMaterials();
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
        Готовые решения
        <Icon
          name="chevron-down"
          className={`${styles.dropdown__icon} ${isOpen ? styles.dropdown__iconOpen : ""}`}
        />
      </button>

      <ul className={styles.dropdown__menu} role="menu">
        {isLoading && (
          <li className={styles.dropdown__empty} role="none">
            Загрузка…
          </li>
        )}
        {!isLoading && materials.length === 0 && (
          <li className={styles.dropdown__empty} role="none">
            Пока нет материалов
          </li>
        )}
        {materials.map((material) => (
          <li key={material.id} role="none">
            <Link
              role="menuitem"
              className={styles.dropdown__link}
              href={`/problems/${material.slug}`}
              onClick={() => setIsOpen(false)}
            >
              {material.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default ProblemsDropdown;
