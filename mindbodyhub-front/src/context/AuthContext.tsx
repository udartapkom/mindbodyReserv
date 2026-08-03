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
import type { ChangePasswordPayload, UpdateProfilePayload, User } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (
    phone: string,
    password: string,
    phoneCountry?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  uploadAvatar: (file: File) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getSafeNextPath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
        setUser(profile);
      } catch {
        authStorage.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    await authApi.login(phone, password);
    setUser(authStorage.getUser());
    const next = getSafeNextPath();
    router.push(next ?? "/cabinet");
  }, [router]);

  const register = useCallback(
    async (phone: string, password: string, phoneCountry?: string) => {
      await authApi.register(phone, password, phoneCountry);
      setUser(authStorage.getUser());
      const next = getSafeNextPath();
      router.push(next ?? "/cabinet");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const profile = await authApi.getProfile();
    setUser(profile);
    return profile;
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const profile = await authApi.updateProfile(payload);
    setUser(profile);
    return profile;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await authApi.changePassword(payload);
    // Server revokes all refresh sessions; force re-login.
    authStorage.removeToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const uploadAvatar = useCallback(async (file: File) => {
    const profile = await authApi.uploadAvatar(file);
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
      uploadAvatar,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
      uploadAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
