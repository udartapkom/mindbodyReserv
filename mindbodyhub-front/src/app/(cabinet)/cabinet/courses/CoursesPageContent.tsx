"use client";

import { useState } from "react";
import Link from "next/link";
import type { Problem } from "@/api/responsesTypes";
import { useAuth } from "@/context/AuthContext";
import { usePublicMaterials } from "@/hooks/usePublicMaterials";
import {
  compareMaterialAccessGroups,
  getMaterialAccessGroupLabel,
  getMaterialAccessLabel,
} from "@/utils/materialAccess";
import { getTariffLabel } from "@/utils/user";
import styles from "./page.module.scss";

const ALL_FILTER = "all";

function matchesQuery(material: Problem, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = `${material.title} ${material.summary ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

function groupMaterials(materials: Problem[]): { tariffType: string; items: Problem[] }[] {
  const byType = new Map<string, Problem[]>();

  for (const material of materials) {
    const key = material.tariffType || "free";
    const list = byType.get(key);
    if (list) {
      list.push(material);
    } else {
      byType.set(key, [material]);
    }
  }

  return [...byType.entries()]
    .sort(([a], [b]) => compareMaterialAccessGroups(a, b))
    .map(([tariffType, items]) => ({ tariffType, items }));
}

function CourseCard({ material }: { material: Problem }) {
  return (
    <Link className={styles.courses__card} href={`/cabinet/courses/${material.slug}`}>
      {material.coverUrl ? (
        <img className={styles.courses__cover} src={material.coverUrl} alt="" />
      ) : (
        <div className={styles.courses__coverPlaceholder} aria-hidden />
      )}
      <div className={styles.courses__cardBody}>
        <span className={styles.courses__badge}>
          {getMaterialAccessLabel(material.tariffType)}
        </span>
        <h3 className={styles.courses__cardTitle}>{material.title}</h3>
        {material.summary ? (
          <p className={styles.courses__cardSummary}>{material.summary}</p>
        ) : null}
      </div>
    </Link>
  );
}

function CoursesPageContent() {
  const { user } = useAuth();
  const { materials, isLoading } = usePublicMaterials();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const normalizedQuery = query.trim().toLowerCase();
  const availableGroups = groupMaterials(materials);
  const filterOptions = [
    { value: ALL_FILTER, label: "Все", count: materials.length },
    ...availableGroups.map((group) => ({
      value: group.tariffType,
      label: getMaterialAccessGroupLabel(group.tariffType),
      count: group.items.length,
    })),
  ];

  const filtered = materials.filter((material) => {
    if (activeFilter !== ALL_FILTER && material.tariffType !== activeFilter) {
      return false;
    }
    return matchesQuery(material, normalizedQuery);
  });

  const grouped = groupMaterials(filtered);
  const tariffLabel = getTariffLabel(user?.tariff);

  return (
    <section className={styles.courses}>
      <header className={styles.courses__header}>
        <h1 className={styles.courses__title}>Курсы</h1>
        <p className={styles.courses__lead}>
          Материалы, доступные по вашему тарифу «{tariffLabel}».
          {!isLoading ? ` Сейчас открыто: ${materials.length}.` : null}
        </p>
      </header>

      <div className={styles.courses__toolbar}>
        <label className={styles.courses__search}>
          <span className={styles.courses__searchLabel}>Поиск</span>
          <input
            className={styles.courses__searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти по названию или описанию"
            disabled={isLoading || materials.length === 0}
          />
        </label>

        {materials.length > 0 ? (
          <div className={styles.courses__filters} role="tablist" aria-label="Фильтр по доступу">
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={
                    isActive
                      ? `${styles.courses__filter} ${styles.courses__filter_active}`
                      : styles.courses__filter
                  }
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                  <span className={styles.courses__filterCount}>{option.count}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className={styles.courses__status}>Загрузка курсов…</p>
      ) : materials.length === 0 ? (
        <div className={styles.courses__empty}>
          <p className={styles.courses__emptyTitle}>Пока нет доступных материалов</p>
          <p className={styles.courses__emptyText}>
            Оформите тариф, чтобы открыть курсы и готовые решения.
          </p>
          <Link className={styles.courses__cta} href="/price">
            Смотреть тарифы
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.courses__status}>
          Ничего не найдено. Попробуйте другой запрос или фильтр.
        </p>
      ) : (
        <div className={styles.courses__groups}>
          {grouped.map((group) => (
            <section key={group.tariffType} className={styles.courses__group}>
              <div className={styles.courses__groupHeader}>
                <h2 className={styles.courses__groupTitle}>
                  {getMaterialAccessGroupLabel(group.tariffType)}
                </h2>
                <span className={styles.courses__groupCount}>
                  {group.items.length}
                </span>
              </div>
              <ul className={styles.courses__list}>
                {group.items.map((material) => (
                  <li key={material.id}>
                    <CourseCard material={material} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

export default CoursesPageContent;
