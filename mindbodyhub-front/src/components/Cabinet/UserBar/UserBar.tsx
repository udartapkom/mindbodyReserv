'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import { getDisplayName, getRoleLabel, getTariffLabel } from '@/utils/user';
import styles from './UserBar.module.scss';

function getInitials(displayName: string, phone?: string | null): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  const second = parts[1] ?? '';

  if (second && !/^\+?\d/.test(first)) {
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }

  if (first && !/^\+?\d/.test(first)) {
    return first.slice(0, 2).toUpperCase();
  }

  return (phone ?? '?').replace(/\D/g, '').slice(-2) || '?';
}

function getTariffBadgeClass(tariff: string): string {
  if (tariff === 'vip') {
    return styles.userBar__badge_vip;
  }

  if (tariff === 'popular' || tariff === 'premium') {
    return styles.userBar__badge_popular;
  }

  if (tariff === 'trial' || tariff === 'basic') {
    return styles.userBar__badge_trial;
  }

  return styles.userBar__badge_free;
}

function UserBar() {
  const { user, isLoading } = useAuth();
  const displayName = getDisplayName(user);
  const avatarSrc = user?.avatarUrl ?? user?.avatar ?? null;
  const initials = getInitials(displayName, user?.phone);
  const tariff = user?.tariff ?? 'free';
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className={styles.userBar}>
      <div className={styles.userBar__identity}>
        <Link
          href="/cabinet/profile"
          className={styles.userBar__avatar}
          aria-label="Открыть настройки профиля"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={displayName}
              className={styles.userBar__avatarImage}
            />
          ) : (
            <span className={styles.userBar__avatarPlaceholder} aria-hidden>
              {initials}
            </span>
          )}
        </Link>

        <div className={styles.userBar__info}>
          <h2 className={styles.userBar__name}>
            {isLoading ? 'Загрузка…' : displayName}
          </h2>
          {user?.phone ? (
            <p className={styles.userBar__phone}>{user.phone}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.userBar__meta}>
        <div className={styles.userBar__metaItem}>
          <span className={styles.userBar__metaLabel}>Роль</span>
          <span
            className={`${styles.userBar__badge} ${
              isAdmin ? styles.userBar__badge_admin : styles.userBar__badge_user
            }`}
          >
            {user ? getRoleLabel(user.role) : '—'}
          </span>
        </div>

        <div className={styles.userBar__metaItem}>
          <span className={styles.userBar__metaLabel}>Тариф</span>
          <span className={`${styles.userBar__badge} ${getTariffBadgeClass(tariff)}`}>
            {getTariffLabel(user?.tariff)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default UserBar;
