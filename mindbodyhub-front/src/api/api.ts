import { auth as authStorage } from "./auth";
import type { User } from "@/types/user";

const isLocalDevHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);

export const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (process.env.NODE_ENV === "development") {
    if (typeof window !== "undefined" && isLocalDevHost(window.location.hostname)) {
      return `http://${window.location.hostname}:4000`;
    }
    return "http://localhost:4000";
  }

  return "https://api.mindbodyhub.pro";
};

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw json;
  }
  return res.json() as Promise<T>;
};

const saveAuthSession = (data: AuthTokensResponse) => {
  authStorage.setToken(data.accessToken);
  authStorage.setRefreshToken(data.refreshToken);
  authStorage.setUser(data.user);
};

export type HealthResponse = { status: string };
export const getHealth = (): Promise<HealthResponse> =>
  fetch(`${getApiBaseUrl()}/health`).then((res) => checkResponse(res));

export const auth = {
  login: async (phone: string, password: string) => {
    const data = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    }).then((res) => checkResponse<AuthTokensResponse>(res));

    saveAuthSession(data);
  },
  logout: async () => {
    const refreshToken = authStorage.getRefreshToken();

    if (refreshToken) {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }

    authStorage.removeToken();
  },
  getProfile: async () => {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    return fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => checkResponse<User>(res));
  },
  register: async (phone: string, password: string) => {
    const data = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    }).then((res) => checkResponse<AuthTokensResponse>(res));

    saveAuthSession(data);
  },
};
