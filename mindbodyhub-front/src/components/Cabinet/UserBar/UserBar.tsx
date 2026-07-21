'use client';

import { useAuth } from '@/context/AuthContext';
import { getDisplayName, getRoleLabel, getTariffLabel } from '@/utils/user';
import styles from './UserBar.module.scss';

function UserBar() {
  const { user, isLoading } = useAuth();
  const displayName = getDisplayName(user);
  const avatarSrc = user?.avatarUrl ?? user?.avatar ?? null;

  return (
    <div className={styles.userBar}>
      <div className={styles.userBar__avatar}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className={styles.userBar__avatarImage}
          />
        ) : (
          <div className={styles.userBar__avatarPlaceholder} />
        )}
      </div>
      <h2 className={styles.userBar__name}>
        {isLoading ? 'Загрузка...' : displayName}
      </h2>
      <div className={styles.userBar__items}>
        <span className={styles.userBar__itemTitle}>Роль:</span>
        <p className={styles.userBar__item}>
          {user ? getRoleLabel(user.role) : '—'}
        </p>
      </div>
      <div className={styles.userBar__items}>
        <span className={styles.userBar__itemTitle}>Тариф:</span>
        <p className={styles.userBar__item}>{getTariffLabel(user?.tariff)}</p>
      </div>
      <div className={styles.userBar__items}>
        <span className={styles.userBar__itemTitle}>Телефон:</span>
        <p className={styles.userBar__item}>{user?.phone ?? '—'}</p>
      </div>
    </div>
  );
}

export default UserBar;
