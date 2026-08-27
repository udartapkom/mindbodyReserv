'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { problems } from '@/api/api';
import type { Problem } from '@/api/responsesTypes';
import { useAuth } from '@/context/AuthContext';
import { REGISTERED_ACCESS_TYPE } from '@/types/material';
import {
  canAccessMaterialShelf,
  getMaterialShelfLabel,
  isCabinetMaterialShelf,
  type CabinetMaterialShelf,
} from '@/utils/materialAccess';
import styles from './page.module.scss';

type MaterialsShelfContentProps = {
  tariff: string;
};

function matchesQuery(material: Problem, query: string): boolean {
  if (!query) return true;
  const haystack = `${material.title} ${material.summary ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

function MaterialsShelfContent({ tariff }: MaterialsShelfContentProps) {
  if (!isCabinetMaterialShelf(tariff)) {
    notFound();
  }

  const shelf = tariff as CabinetMaterialShelf;
  const { user, isAuthenticated } = useAuth();
  const hasAccess = canAccessMaterialShelf(
    shelf,
    user?.tariff,
    isAuthenticated,
  );
  const label = getMaterialShelfLabel(shelf);
  const isRegisteredShelf = shelf === REGISTERED_ACCESS_TYPE;

  const [materials, setMaterials] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(hasAccess);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(!hasAccess);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!hasAccess) {
      setForbidden(true);
      setIsLoading(false);
      setMaterials([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError('');

    problems
      .getCabinetShelf(shelf)
      .then((data) => {
        if (!cancelled) {
          setMaterials(data);
          setForbidden(false);
        }
      })
      .catch((err) => {
        const status =
          err && typeof err === 'object' && 'statusCode' in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;
        if (!cancelled) {
          if (status === 403) {
            setForbidden(true);
            setMaterials([]);
          } else {
            setError('Не удалось загрузить материалы');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasAccess, shelf]);

  if (!hasAccess || forbidden) {
    return (
      <section className={styles.shelf}>
        <header className={styles.shelf__header}>
          <Link className={styles.shelf__back} href="/cabinet/materials">
            ← Все материалы
          </Link>
          <h1 className={styles.shelf__title}>{label}</h1>
          <p className={styles.shelf__lead}>
            {isRegisteredShelf
              ? 'Этот раздел доступен всем зарегистрированным пользователям.'
              : `Этот раздел доступен только на тарифе «${label}».`}
          </p>
        </header>
        <div className={styles.shelf__empty}>
          <p className={styles.shelf__emptyTitle}>Раздел закрыт</p>
          <p className={styles.shelf__emptyText}>
            {isRegisteredShelf
              ? 'Войдите в аккаунт, чтобы открыть материалы.'
              : `Подключите подходящий тариф, чтобы открыть материалы полки «${label}».`}
          </p>
          {!isRegisteredShelf ? (
            <Link className={styles.shelf__cta} href="/price">
              Смотреть тарифы
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = materials.filter((item) =>
    matchesQuery(item, normalizedQuery),
  );

  return (
    <section className={styles.shelf}>
      <header className={styles.shelf__header}>
        <Link className={styles.shelf__back} href="/cabinet/materials">
          ← Все материалы
        </Link>
        <h1 className={styles.shelf__title}>{label}</h1>
        <p className={styles.shelf__lead}>
          {isRegisteredShelf
            ? 'Материалы для всех зарегистрированных.'
            : `Только материалы тарифа «${label}».`}
          {!isLoading ? ` Сейчас: ${materials.length}.` : null}
        </p>
      </header>

      <div className={styles.shelf__toolbar}>
        <label className={styles.shelf__search}>
          <span className={styles.shelf__searchLabel}>Поиск</span>
          <input
            className={styles.shelf__searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти по названию или описанию"
            disabled={isLoading || materials.length === 0}
          />
        </label>
      </div>

      {error ? <p className={styles.shelf__status}>{error}</p> : null}

      {isLoading ? (
        <p className={styles.shelf__status}>Загрузка…</p>
      ) : materials.length === 0 ? (
        <div className={styles.shelf__empty}>
          <p className={styles.shelf__emptyTitle}>Пока нет материалов</p>
          <p className={styles.shelf__emptyText}>
            В этом разделе ещё нет опубликованных статей.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.shelf__status}>Ничего не найдено.</p>
      ) : (
        <ul className={styles.shelf__list}>
          {filtered.map((material) => (
            <li key={material.id}>
              <Link
                className={styles.shelf__card}
                href={`/cabinet/materials/${shelf}/${material.slug}`}
              >
                {material.coverUrl ? (
                  <img
                    className={styles.shelf__cover}
                    src={material.coverUrl}
                    alt=""
                  />
                ) : (
                  <div className={styles.shelf__coverPlaceholder} aria-hidden />
                )}
                <div className={styles.shelf__cardBody}>
                  <h3 className={styles.shelf__cardTitle}>{material.title}</h3>
                  {material.summary ? (
                    <p className={styles.shelf__cardSummary}>{material.summary}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MaterialsShelfContent;
