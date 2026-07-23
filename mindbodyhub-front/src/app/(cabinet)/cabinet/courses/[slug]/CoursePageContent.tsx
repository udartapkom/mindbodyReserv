"use client";

import Link from "next/link";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import { useAuth } from "@/context/AuthContext";
import { useMaterialBySlug } from "@/hooks/useMaterialBySlug";
import { getMaterialAccessLabel } from "@/utils/materialAccess";
import styles from "./page.module.scss";

type CoursePageContentProps = {
  slug: string;
};

function CoursePageContent({ slug }: CoursePageContentProps) {
  const { isAuthenticated } = useAuth();
  const state = useMaterialBySlug(slug);

  if (state.status === "loading") {
    return (
      <div className={styles.course}>
        <p className={styles.course__status}>Загрузка материала…</p>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className={styles.course}>
        <Link className={styles.course__back} href="/cabinet/courses">
          ← К списку курсов
        </Link>
        <p className={styles.course__eyebrow}>Доступ ограничен</p>
        <h1 className={styles.course__title}>Нет доступа к материалу</h1>
        <p className={styles.course__summary}>{state.message}</p>
        <div className={styles.course__actions}>
          {!isAuthenticated ? (
            <Link className={styles.course__link} href="/login">
              Войти
            </Link>
          ) : (
            <Link className={styles.course__link} href="/price">
              Смотреть тарифы
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className={styles.course}>
        <Link className={styles.course__back} href="/cabinet/courses">
          ← К списку курсов
        </Link>
        <h1 className={styles.course__title}>Материал не найден</h1>
        <p className={styles.course__summary}>
          Возможно, страница была удалена или ещё не опубликована.
        </p>
      </div>
    );
  }

  const { material } = state;

  return (
    <div className={styles.course}>
      <Link className={styles.course__back} href="/cabinet/courses">
        ← К списку курсов
      </Link>

      <article className={styles.course__shell}>
        {material.coverUrl ? (
          <div className={styles.course__hero}>
            <img className={styles.course__cover} src={material.coverUrl} alt="" />
          </div>
        ) : null}

        <header className={styles.course__header}>
          <p className={styles.course__eyebrow}>
            {getMaterialAccessLabel(material.tariffType)}
          </p>
          <h1 className={styles.course__title}>{material.title}</h1>
          {material.summary ? (
            <p className={styles.course__summary}>{material.summary}</p>
          ) : null}
        </header>

        <div className={styles.course__divider} />

        <div className={styles.course__body}>
          <MaterialContent blocks={material.blocks} />
        </div>
      </article>
    </div>
  );
}

export default CoursePageContent;
