import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import UsersPage from '@/pages/UsersPage/UsersPage';
import TariffsPage from '@/pages/TariffsPage/TariffsPage';
import MaterialsPage from '@/pages/MaterialsPage/MaterialsPage';
import MaterialEditPage from '@/pages/MaterialEditPage/MaterialEditPage';
import KnowledgePage from '@/pages/KnowledgePage/KnowledgePage';
import KnowledgeEditPage from '@/pages/KnowledgeEditPage/KnowledgeEditPage';
import TicketsPage from '@/pages/TicketsPage/TicketsPage';
import PaymentsPage from '@/pages/PaymentsPage/PaymentsPage';
import SettingsPage from '@/pages/SettingsPage/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/materials/:id/edit" element={<MaterialEditPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/:id/edit" element={<KnowledgeEditPage />} />
            <Route path="/tariffs" element={<TariffsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/accounting" element={<PaymentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
