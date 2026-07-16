import { NavLink } from 'react-router-dom';
import { adminNav } from '@/content/nav';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.scss';

function Sidebar() {
  const { user, logout } = useAuth();
  const displayName =
    user?.name?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.phone ||
    'Админ';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__brand}>
        <span className={styles.sidebar__logo}>MindBodyHub</span>
        <span className={styles.sidebar__subtitle}>Админ-панель</span>
      </div>

      <nav className={styles.sidebar__nav}>
        {adminNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              [styles.sidebar__link, isActive ? styles.sidebar__link_active : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebar__footer}>
        <p className={styles.sidebar__user}>{displayName}</p>
        <button type="button" className={styles.sidebar__logout} onClick={() => void logout()}>
          Выйти
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
