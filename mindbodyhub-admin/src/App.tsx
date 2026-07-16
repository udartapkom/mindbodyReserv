import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import LoginPage from '@/pages/LoginPage/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage/PlaceholderPage';
import UsersPage from '@/pages/UsersPage/UsersPage';
import TariffsPage from '@/pages/TariffsPage/TariffsPage';
import MaterialsPage from '@/pages/MaterialsPage/MaterialsPage';
import MaterialEditPage from '@/pages/MaterialEditPage/MaterialEditPage';
import KnowledgePage from '@/pages/KnowledgePage/KnowledgePage';
import KnowledgeEditPage from '@/pages/KnowledgeEditPage/KnowledgeEditPage';

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
            <Route path="/tickets" element={<PlaceholderPage title="Обращения" />} />
            <Route path="/accounting" element={<PlaceholderPage title="Бухгалтерия" />} />
            <Route path="/settings" element={<PlaceholderPage title="Настройки" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
