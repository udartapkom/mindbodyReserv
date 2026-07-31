'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { problems } from '@/api/api';
import type { Problem } from '@/api/responsesTypes';
import MaterialAdjacentNav from '@/components/MaterialAdjacentNav/MaterialAdjacentNav';
import MaterialContent from '@/components/MaterialContent/MaterialContent';
import MaterialReadingMeta from '@/components/MaterialReadingMeta/MaterialReadingMeta';
import MaterialScrollAids from '@/components/MaterialScrollAids/MaterialScrollAids';
import MaterialShareButton from '@/components/MaterialShareButton/MaterialShareButton';
import MaterialToc from '@/components/MaterialToc/MaterialToc';
import { useAuth } from '@/context/AuthContext';
import { useMaterialBySlug } from '@/hooks/useMaterialBySlug';
import {
  getMaterialAccessLabel,
  getMaterialShelfLabel,
  type PaidMaterialShelf,
} from '@/utils/materialAccess';
import { extractMaterialToc, getAdjacentMaterials } from '@/utils/materialToc';
import {
  estimateReadingMinutes,
  formatPublishedAt,
  formatReadingTimeLabel,
} from '@/utils/readingTime';
import styles from './page.module.scss';

type MaterialDetailContentProps = {
  tariff: PaidMaterialShelf;
  slug: string;
};

function MaterialDetailContent({ tariff, slug }: MaterialDetailContentProps) {
  const { isAuthenticated } = useAuth();
  const state = useMaterialBySlug(slug);
  const shelfLabel = getMaterialShelfLabel(tariff);
  const backHref = `/cabinet/materials/${tariff}`;
  const [shelfMaterials, setShelfMaterials] = useState<Problem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void problems
      .getCabinetShelf(tariff)
      .then((data) => {
        if (!cancelled) setShelfMaterials(data);
      })
      .catch(() => {
        if (!cancelled) setShelfMaterials([]);
      });

    return () => {
      cancelled = true;
    };
  }, [tariff]);

  if (state.status === 'loading') {
    return (
      <div className={styles.material}>
        <p className={styles.material__status}>Загрузка материала…</p>
      </div>
    );
  }

  if (state.status === 'forbidden') {
    return (
      <div className={styles.material}>
        <Link className={styles.material__back} href={backHref}>
          ← К разделу «{shelfLabel}»
        </Link>
        <p className={styles.material__eyebrow}>Доступ ограничен</p>
        <h1 className={styles.material__title}>Нет доступа к материалу</h1>
        <p className={styles.material__summary}>{state.message}</p>
        <div className={styles.material__actions}>
          {!isAuthenticated ? (
            <Link className={styles.material__link} href="/login">
              Войти
            </Link>
          ) : (
            <Link className={styles.material__link} href="/price">
              Смотреть тарифы
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className={styles.material}>
        <Link className={styles.material__back} href={backHref}>
          ← К разделу «{shelfLabel}»
        </Link>
        <h1 className={styles.material__title}>Материал не найден</h1>
        <p className={styles.material__summary}>
          Возможно, страница была удалена или ещё не опубликована.
        </p>
      </div>
    );
  }

  const { material } = state;

  if (material.tariffType !== tariff) {
    return (
      <div className={styles.material}>
        <Link className={styles.material__back} href="/cabinet/materials">
          ← Все материалы
        </Link>
        <h1 className={styles.material__title}>Материал в другом разделе</h1>
        <p className={styles.material__summary}>
          Эта статья относится к полке «
          {getMaterialShelfLabel(material.tariffType)}».
        </p>
        <div className={styles.material__actions}>
          <Link
            className={styles.material__link}
            href={`/cabinet/materials/${material.tariffType}/${material.slug}`}
          >
            Перейти к материалу
          </Link>
        </div>
      </div>
    );
  }

  const toc = extractMaterialToc(material.blocks);
  const { prev, next } = getAdjacentMaterials(shelfMaterials, slug);
  const readingTimeLabel = formatReadingTimeLabel(
    estimateReadingMinutes(material.blocks),
  );
  const publishedLabel =
    material.showMetadata !== false
      ? formatPublishedAt(material.publishedAt)
      : null;

  return (
    <div className={styles.material}>
      <MaterialScrollAids offsetForCabinetNav materialId={material.id} />
      <Link className={styles.material__back} href={backHref}>
        ← К разделу «{shelfLabel}»
      </Link>

      <article className={styles.material__shell}>
        {material.coverUrl ? (
          <div className={styles.material__hero}>
            <img className={styles.material__cover} src={material.coverUrl} alt="" />
          </div>
        ) : null}

        <header className={styles.material__header}>
          {material.showMetadata !== false ? (
            <p className={styles.material__eyebrow}>
              {getMaterialAccessLabel(material.tariffType)}
            </p>
          ) : null}
          <h1 className={styles.material__title}>{material.title}</h1>
          <div className={styles.material__metaRow}>
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
            <p className={styles.material__summary}>{material.summary}</p>
          ) : null}
        </header>

        <div className={styles.material__divider} />

        <div className={styles.material__body}>
          <MaterialToc items={toc} className={styles.material__toc} />
          <MaterialContent blocks={material.blocks} />
          <MaterialAdjacentNav
            prev={
              prev
                ? {
                    slug: prev.slug,
                    title: prev.title,
                    href: `/cabinet/materials/${tariff}/${prev.slug}`,
                  }
                : null
            }
            next={
              next
                ? {
                    slug: next.slug,
                    title: next.title,
                    href: `/cabinet/materials/${tariff}/${next.slug}`,
                  }
                : null
            }
          />
        </div>
      </article>
    </div>
  );
}

export default MaterialDetailContent;
