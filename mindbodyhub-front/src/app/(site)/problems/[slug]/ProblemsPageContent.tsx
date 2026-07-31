"use client";

import Link from "next/link";
import MaterialAdjacentNav from "@/components/MaterialAdjacentNav/MaterialAdjacentNav";
import MaterialContent from "@/components/MaterialContent/MaterialContent";
import MaterialReadingMeta from "@/components/MaterialReadingMeta/MaterialReadingMeta";
import MaterialScrollAids from "@/components/MaterialScrollAids/MaterialScrollAids";
import MaterialShareButton from "@/components/MaterialShareButton/MaterialShareButton";
import MaterialToc from "@/components/MaterialToc/MaterialToc";
import { useAuth } from "@/context/AuthContext";
import { useMaterialBySlug } from "@/hooks/useMaterialBySlug";
import { usePublicMaterials } from "@/hooks/usePublicMaterials";
import { FREE_ACCESS_TYPE } from "@/types/material";
import { getMaterialAccessLabel } from "@/utils/materialAccess";
import { extractMaterialToc, getAdjacentMaterials } from "@/utils/materialToc";
import {
  estimateReadingMinutes,
  formatPublishedAt,
  formatReadingTimeLabel,
} from "@/utils/readingTime";
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
  const toc = extractMaterialToc(material.blocks);
  const { prev, next } = getAdjacentMaterials(materials, slug);
  const readingTimeLabel = formatReadingTimeLabel(
    estimateReadingMinutes(material.blocks),
  );
  const publishedLabel =
    material.showMetadata !== false
      ? formatPublishedAt(material.publishedAt)
      : null;

  return (
    <div className={styles.page}>
      <MaterialScrollAids materialId={material.id} />
      <div className={styles.page__backWrap}>
        <Link className={styles.page__back} href="/problems">
          ← Все готовые решения
        </Link>
      </div>

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
          <div className={styles.page__metaRow}>
            <MaterialReadingMeta
              readingTimeLabel={readingTimeLabel}
              publishedLabel={publishedLabel}
              publishedDateTime={material.publishedAt}
            />
            <MaterialShareButton
              title={material.title}
              text={material.summary}
            />
          </div>
          {material.showMetadata !== false && material.summary ? (
            <p className={styles.page__summary}>{material.summary}</p>
          ) : null}
        </header>

        <div className={styles.page__divider} />

        <div className={styles.page__body}>
          <MaterialToc items={toc} className={styles.page__toc} />
          <MaterialContent blocks={material.blocks} />
          <MaterialAdjacentNav
            prev={
              prev
                ? {
                    slug: prev.slug,
                    title: prev.title,
                    href: `/problems/${prev.slug}`,
                  }
                : null
            }
            next={
              next
                ? {
                    slug: next.slug,
                    title: next.title,
                    href: `/problems/${next.slug}`,
                  }
                : null
            }
          />
        </div>
      </article>
    </div>
  );
}

export default ProblemsPageContent;
