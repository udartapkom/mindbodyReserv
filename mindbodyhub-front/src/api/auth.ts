import type { User } from "@/types/user";

const TOKEN_STORAGE_KEY = "user_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const USER_STORAGE_KEY = "user_data";

function safeParseUser(raw: string | null): User | null {
  if (!raw || raw === "null" || raw === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as User;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export const auth = {
  getToken: () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  },
  setToken: (token: string) => {
    if (!token) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  getRefreshToken: () => {
    const token = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  },
  setRefreshToken: (token: string) => {
    if (!token) return;
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
  getUser: (): User | null => safeParseUser(localStorage.getItem(USER_STORAGE_KEY)),
  setUser: (user: User) => {
    if (!user) return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  isAuthenticated: () => !!auth.getToken(),
};
