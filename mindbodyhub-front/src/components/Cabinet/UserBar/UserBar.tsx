'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './UserBar.module.scss';

function UserBar() {
    const { user, isLoading } = useAuth();

    const displayName = user?.name?.trim() || user?.phone || 'Пользователь';

    return (
        <div className={styles.userBar}>
            <div className={styles.userBar__avatar}>
                {user?.avatar ? (
                    <img src={user?.avatar} alt={displayName} className={styles.userBar__avatarImage} />
                ) : (
                    <div className={styles.userBar__avatarPlaceholder}></div>
                )}
                
            </div>
            <h2 className={styles.userBar__name}>
                {isLoading ? 'Загрузка...' : displayName}
            </h2>
            <div className={styles.userBar__items}>
                <span className={styles.userBar__itemTitle}>Роль:</span>
                <p className={styles.userBar__item}>{user?.role}</p>
            </div>
            <div className={styles.userBar__items}>
                <span className={styles.userBar__itemTitle}>Тариф:</span>
                <p className={styles.userBar__item}>VIP</p>
            </div>
            <div className={styles.userBar__items}>
                <span className={styles.userBar__itemTitle}>Истекает:</span>
                <p className={styles.userBar__item}>{new Date(user?.createdAt || '').toLocaleDateString()}</p>
            </div>
        </div>
    );
}

export default UserBar;
