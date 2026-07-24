"use client";

import Link from "next/link";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import { useAuth } from "@/context/AuthContext";
import { useMaterialBySlug } from "@/hooks/useMaterialBySlug";
import { getMaterialAccessLabel } from "@/utils/materialAccess";
import styles from "./page.module.scss";

type ProblemsPageContentProps = {
  slug: string;
};

function ProblemsPageContent({ slug }: ProblemsPageContentProps) {
  const { isAuthenticated } = useAuth();
  const state = useMaterialBySlug(slug);

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

  return (
    <div className={styles.page}>
      <article className={styles.page__shell}>
        {material.coverUrl ? (
          <div className={styles.page__hero}>
            <img
              className={styles.page__cover}
              src={material.coverUrl}
              alt=""
            />
          </div>
        ) : null}

        <header className={styles.page__header}>
          {material.showMetadata !== false ? (
            <p className={styles.page__eyebrow}>
              {getMaterialAccessLabel(material.tariffType)}
            </p>
          ) : null}
          <h1 className={styles.page__title}>{material.title}</h1>
          {material.showMetadata !== false && material.summary ? (
            <p className={styles.page__summary}>{material.summary}</p>
          ) : null}
        </header>

        <div className={styles.page__divider} />

        <div className={styles.page__body}>
          <MaterialContent blocks={material.blocks} />
        </div>
      </article>
    </div>
  );
}

export default ProblemsPageContent;
