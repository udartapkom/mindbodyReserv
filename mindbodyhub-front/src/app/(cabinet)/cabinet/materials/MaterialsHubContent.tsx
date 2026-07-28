'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  canAccessMaterialShelf,
  getMaterialShelfLabel,
  PAID_MATERIAL_SHELVES,
} from '@/utils/materialAccess';
import styles from './page.module.scss';

const SHELF_DESCRIPTIONS: Record<string, string> = {
  trial: 'Материалы пробного тарифа — материалы тарифа Философия.',
  popular: 'Материалы популярного тарифа — Отношения & секс.',
  vip: 'Материалы VIP — Психология здоровья & бизнеса.',
};

function MaterialsHubContent() {
  const { user } = useAuth();
  const userTariff = user?.tariff;

  return (
    <section className={styles.materials}>
      <header className={styles.materials__header}>
        <h1 className={styles.materials__title}>Материалы</h1>
        <p className={styles.materials__lead}>
          Выберите раздел тарифа. В каждом разделе — только материалы этой полки.
        </p>
      </header>

      <ul className={styles.materials__shelves}>
        {PAID_MATERIAL_SHELVES.map((shelf) => {
          const open = canAccessMaterialShelf(shelf, userTariff);
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
                    Доступно на тарифе «{label}»
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
