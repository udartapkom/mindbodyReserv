import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth as authStorage } from '@/api/auth';
import { auth as authApi } from '@/api/api';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();

    if (token && storedUser?.role === UserRole.ADMIN) {
      setUser(storedUser);
    } else if (token) {
      authStorage.removeToken();
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      await authApi.login(phone, password);
      setUser(authStorage.getUser());
      navigate('/users');
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
