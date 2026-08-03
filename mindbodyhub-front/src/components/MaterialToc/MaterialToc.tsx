"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MaterialTocItem } from "@/utils/materialToc";
import styles from "./MaterialToc.module.scss";

type MaterialTocProps = {
  items: MaterialTocItem[];
  className?: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });

  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

function MaterialToc({ items, className }: MaterialTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const sectionKey = useMemo(
    () => items.map((item) => item.id).join("|"),
    [items],
  );

  useEffect(() => {
    const list = itemsRef.current;
    if (list.length < 2) {
      return;
    }

    const updateActive = () => {
      const sections = itemsRef.current;
      const probe = window.scrollY + window.innerHeight * 0.28;
      let current: string | null = sections[0]?.id ?? null;

      for (const item of sections) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= probe) {
          current = item.id;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sectionKey]);

  if (items.length < 2) {
    return null;
  }

  return (
    <nav
      className={[styles.materialToc, className].filter(Boolean).join(" ")}
      aria-label="Оглавление"
    >
      <p className={styles.materialToc__title}>Содержание</p>
      <ol className={styles.materialToc__list}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.blockId}
              className={[
                styles.materialToc__item,
                item.level === 3 ? styles.materialToc__item_nested : null,
                isActive ? styles.materialToc__item_active : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <a
                className={[
                  styles.materialToc__link,
                  isActive ? styles.materialToc__link_active : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return;
                  }
                  event.preventDefault();
                  setActiveId(item.id);
                  scrollToAnchor(item.id);
                }}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default MaterialToc;
