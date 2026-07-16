import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './AdminLayout.module.scss';

function AdminLayout() {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.adminLayout__content}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
