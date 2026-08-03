"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { problems } from "@/api/api";
import type { Problem } from "@/api/responsesTypes";
import MaterialReaderShell from "@/components/MaterialReaderShell/MaterialReaderShell";
import { useAuth } from "@/context/AuthContext";
import { useMaterialBySlug } from "@/hooks/useMaterialBySlug";
import {
  getMaterialAccessLabel,
  getMaterialShelfLabel,
  type PaidMaterialShelf,
} from "@/utils/materialAccess";
import { getAdjacentMaterials } from "@/utils/materialToc";
import styles from "./page.module.scss";

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

  if (state.status === "loading") {
    return (
      <div className={styles.material}>
        <p className={styles.material__status}>Загрузка материала…</p>
      </div>
    );
  }

  if (state.status === "forbidden") {
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

  if (state.status === "not-found") {
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

  const { prev, next } = getAdjacentMaterials(shelfMaterials, slug);

  return (
    <MaterialReaderShell
      key={material.id}
      layout="cabinet"
      document={{
        id: material.id,
        title: material.title,
        summary: material.summary,
        coverUrl: material.coverUrl,
        blocks: material.blocks,
        showMetadata: material.showMetadata,
        publishedAt: material.publishedAt,
      }}
      back={{
        href: backHref,
        label: `← К разделу «${shelfLabel}»`,
      }}
      eyebrow={getMaterialAccessLabel(material.tariffType)}
      adjacent={{
        prev: prev
          ? {
              slug: prev.slug,
              title: prev.title,
              href: `/cabinet/materials/${tariff}/${prev.slug}`,
            }
          : null,
        next: next
          ? {
              slug: next.slug,
              title: next.title,
              href: `/cabinet/materials/${tariff}/${next.slug}`,
            }
          : null,
      }}
      scrollAids={{
        materialId: material.id,
        offsetForCabinetNav: true,
      }}
    />
  );
}

export default MaterialDetailContent;
