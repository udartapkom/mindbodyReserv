'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { REGISTERED_ACCESS_TYPE } from '@/types/material';
import {
  CABINET_MATERIAL_SHELVES,
  canAccessMaterialShelf,
  getMaterialShelfLabel,
  isPaidMaterialShelf,
} from '@/utils/materialAccess';
import styles from './page.module.scss';

const SHELF_DESCRIPTIONS: Record<string, string> = {
  [REGISTERED_ACCESS_TYPE]:
    'Материалы для всех зарегистрированных — доступны с любого аккаунта и тарифа.',
  trial: 'Материалы пробного тарифа — материалы тарифа Философия.',
  popular: 'Материалы популярного тарифа — Отношения & секс.',
  vip: 'Материалы VIP — Психология здоровья & бизнеса.',
};

function MaterialsHubContent() {
  const { user, isAuthenticated } = useAuth();
  const userTariff = user?.tariff;

  return (
    <section className={styles.materials}>
      <header className={styles.materials__header}>
        <h1 className={styles.materials__title}>Материалы</h1>
        <p className={styles.materials__lead}>
          Выберите раздел. В каждом — только материалы этой полки.
        </p>
      </header>

      <ul className={styles.materials__shelves}>
        {CABINET_MATERIAL_SHELVES.map((shelf) => {
          const open = canAccessMaterialShelf(
            shelf,
            userTariff,
            isAuthenticated,
          );
          const label = getMaterialShelfLabel(shelf);
          return (
            <li key={shelf}>
              <Link
                href={`/cabinet/materials/${shelf}`}
                className={[
                  styles.materials__shelfCard,
                  open ? '' : styles.materials__shelfCard_locked,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <h2 className={styles.materials__shelfTitle}>{label}</h2>
                <p className={styles.materials__shelfText}>
                  {SHELF_DESCRIPTIONS[shelf]}
                </p>
                {open ? (
                  <p className={styles.materials__shelfMeta}>Открыть раздел →</p>
                ) : (
                  <p className={styles.materials__shelfLocked}>
                    {isPaidMaterialShelf(shelf)
                      ? `Доступно на тарифе «${label}»`
                      : 'Войдите в аккаунт, чтобы открыть раздел'}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default MaterialsHubContent;
