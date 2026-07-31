import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAdminHomePath, isAdminRole } from '@/types/user';

type RoleRouteProps = {
  /** Allowed roles; default = any staff already past ProtectedRoute */
  allow?: Array<'admin' | 'editor'>;
};

export function RoleRoute({ allow }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 24 }}>Загрузка...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allow?.length && !allow.includes(user.role as 'admin' | 'editor')) {
    return <Navigate to={getAdminHomePath(user.role)} replace />;
  }

  return <Outlet />;
}

export function AdminOnlyRoute() {
  return <RoleRoute allow={['admin']} />;
}

export function requireAdmin(userRole: string | null | undefined): boolean {
  return isAdminRole(userRole);
}
