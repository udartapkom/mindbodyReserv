import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { AdminOnlyRoute } from '@/components/RoleRoute/RoleRoute';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import UsersPage from '@/pages/UsersPage/UsersPage';
import TariffsPage from '@/pages/TariffsPage/TariffsPage';
import MaterialsPage from '@/pages/MaterialsPage/MaterialsPage';
import MaterialEditPage from '@/pages/MaterialEditPage/MaterialEditPage';
import KnowledgePage from '@/pages/KnowledgePage/KnowledgePage';
import KnowledgeEditPage from '@/pages/KnowledgeEditPage/KnowledgeEditPage';
import QuotesPage from '@/pages/QuotesPage/QuotesPage';
import TicketsPage from '@/pages/TicketsPage/TicketsPage';
import PaymentsPage from '@/pages/PaymentsPage/PaymentsPage';
import SettingsPage from '@/pages/SettingsPage/SettingsPage';
import SystemPage from '@/pages/SystemPage/SystemPage';
import DbStatusPage from '@/pages/DbStatusPage/DbStatusPage';
import { getAdminHomePath } from '@/types/user';

function HomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div style={{ padding: 24 }}>Загрузка...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getAdminHomePath(user?.role)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/materials/:id/edit" element={<MaterialEditPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/:id/edit" element={<KnowledgeEditPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/tickets" element={<TicketsPage />} />

            <Route element={<AdminOnlyRoute />}>
              <Route path="/tariffs" element={<TariffsPage />} />
              <Route path="/accounting" element={<PaymentsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/system" element={<SystemPage />} />
              <Route path="/db-status" element={<DbStatusPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
