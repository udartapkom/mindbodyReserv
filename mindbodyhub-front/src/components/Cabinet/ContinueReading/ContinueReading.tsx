'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { problems } from '@/api/api';
import type { ReadingProgressItem } from '@/api/responsesTypes';
import { getMaterialReaderHref } from '@/utils/materialAccess';
import styles from './ContinueReading.module.scss';

function ContinueReading() {
  const [items, setItems] = useState<ReadingProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    problems
      .getReadingProgressList()
      .then((data) => {
        if (!cancelled) setItems(data.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.continue} aria-labelledby="continue-reading-title">
      <header className={styles.continue__header}>
        <h2 id="continue-reading-title" className={styles.continue__title}>
          Продолжить чтение
        </h2>
        <p className={styles.continue__lead}>
          Место сохраняется в профиле — можно вернуться с другого устройства.
        </p>
      </header>

      <ul className={styles.continue__list}>
        {items.map((item) => {
          if (!item.material) return null;
          const href = getMaterialReaderHref(item.material);
          const pct = Math.round(item.scrollRatio * 100);

          return (
            <li key={item.materialId}>
              <Link className={styles.continue__card} href={href}>
                {item.material.coverUrl ? (
                  <img
                    className={styles.continue__cover}
                    src={item.material.coverUrl}
                    alt=""
                  />
                ) : (
                  <div className={styles.continue__coverPlaceholder} aria-hidden />
                )}
                <div className={styles.continue__body}>
                  <h3 className={styles.continue__cardTitle}>{item.material.title}</h3>
                  <p className={styles.continue__meta}>Прочитано ~{pct}%</p>
                  <div className={styles.continue__bar} aria-hidden>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ContinueReading;
