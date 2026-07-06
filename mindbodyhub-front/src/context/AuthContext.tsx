// src/context/AuthContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { auth as authStorage } from "@/api/auth";
import { auth as authApi } from "@/api/api";
import type { User } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При загрузке — восстановить сессию из localStorage
  useEffect(() => {
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();

    if (token && storedUser) {
      setUser(storedUser);
    } else if (token && !storedUser) {
      authStorage.removeToken();
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    await authApi.login(phone, password);
    setUser(authStorage.getUser());
    router.push("/cabinet");
  }, [router]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}