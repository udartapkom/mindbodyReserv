"use client";

import Link from "next/link";
import MaterialReaderShell from "@/components/MaterialReaderShell/MaterialReaderShell";
import { useAuth } from "@/context/AuthContext";
import { useMaterialBySlug } from "@/hooks/useMaterialBySlug";
import { usePublicMaterials } from "@/hooks/usePublicMaterials";
import { FREE_ACCESS_TYPE } from "@/types/material";
import { getMaterialAccessLabel } from "@/utils/materialAccess";
import { getAdjacentMaterials } from "@/utils/materialToc";
import styles from "./page.module.scss";

type ProblemsPageContentProps = {
  slug: string;
};

function ProblemsPageContent({ slug }: ProblemsPageContentProps) {
  const { isAuthenticated } = useAuth();
  const state = useMaterialBySlug(slug);
  const { materials } = usePublicMaterials({ tariffType: FREE_ACCESS_TYPE });

  if (state.status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.page__statusShell}>
          <p className={styles.page__status}>Загрузка материала…</p>
        </div>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className={styles.page}>
        <div className={styles.page__statusShell}>
          <p className={styles.page__eyebrow}>Доступ ограничен</p>
          <h1 className={styles.page__title}>Нужна регистрация</h1>
          <p className={styles.page__summary}>{state.message}</p>
          {!isAuthenticated ? (
            <p className={styles.page__actions}>
              <Link className={styles.page__link} href="/login">
                Войти или зарегистрироваться
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className={styles.page}>
        <div className={styles.page__statusShell}>
          <h1 className={styles.page__title}>Материал не найден</h1>
          <p className={styles.page__summary}>
            Возможно, страница была удалена или ещё не опубликована.
          </p>
          <p className={styles.page__actions}>
            <Link className={styles.page__linkSecondary} href="/">
              На главную
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const { material } = state;
  const { prev, next } = getAdjacentMaterials(materials, slug);

  return (
    <MaterialReaderShell
      key={material.id}
      layout="site"
      document={{
        id: material.id,
        title: material.title,
        summary: material.summary,
        coverUrl: material.coverUrl,
        blocks: material.blocks,
        showMetadata: material.showMetadata,
        publishedAt: material.publishedAt,
      }}
      back={{ href: "/problems", label: "← Все готовые решения" }}
      eyebrow={getMaterialAccessLabel(material.tariffType)}
      adjacent={{
        prev: prev
          ? {
              slug: prev.slug,
              title: prev.title,
              href: `/problems/${prev.slug}`,
            }
          : null,
        next: next
          ? {
              slug: next.slug,
              title: next.title,
              href: `/problems/${next.slug}`,
            }
          : null,
      }}
      scrollAids={{ materialId: material.id }}
    />
  );
}

export default ProblemsPageContent;
