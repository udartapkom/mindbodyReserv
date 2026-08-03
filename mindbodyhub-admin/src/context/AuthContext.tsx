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
import { refreshAccessToken } from '@/api/http';
import type { User } from '@/types/user';
import { canAccessAdminPanel, getAdminHomePath } from '@/types/user';

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
    const restoreSession = async () => {
      const token = authStorage.getToken();
      const refreshToken = authStorage.getRefreshToken();

      if (!token && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();

        if (!canAccessAdminPanel(profile.role)) {
          authStorage.removeToken();
          setUser(null);
          return;
        }

        setUser(profile);
      } catch {
        // Access may be expired — try refresh once before logging out.
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          try {
            const profile = await authApi.getProfile();
            if (canAccessAdminPanel(profile.role)) {
              setUser(profile);
              return;
            }
          } catch {
            // fall through
          }
        }
        authStorage.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  // Keep React auth state in sync when another admin tab refreshes tokens.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== 'admin_user_token' &&
        event.key !== 'admin_refresh_token' &&
        event.key !== 'admin_user_data'
      ) {
        return;
      }

      const nextUser = authStorage.getUser();
      if (!authStorage.getToken() && !authStorage.getRefreshToken()) {
        setUser(null);
        return;
      }
      if (nextUser && canAccessAdminPanel(nextUser.role)) {
        setUser(nextUser);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(
    async (phone: string, password: string) => {
      await authApi.login(phone, password);
      const nextUser = authStorage.getUser();
      setUser(nextUser);
      navigate(getAdminHomePath(nextUser?.role));
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
