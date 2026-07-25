import { auth as authStorage } from "./auth";
import type { AuthTokensResponse, Problem } from "./responsesTypes";
import type { KnowledgeArticle } from "@/types/knowledge";
import type { Material } from "@/types/material";
import type { PriceComparison } from "@/types/PriceComparison";
import type { ChangePasswordPayload, UpdateProfilePayload, User } from "@/types/user";
import { normalizeUser } from "@/utils/user";

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

const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    throw {
      ...json,
      statusCode:
        typeof json.statusCode === "number" ? json.statusCode : res.status,
    };
  }
  return res.json() as Promise<T>;
};

const saveAuthSession = (data: AuthTokensResponse) => {
  authStorage.setToken(data.accessToken);
  authStorage.setRefreshToken(data.refreshToken);
  authStorage.setUser(normalizeUser(data.user));
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return false;
      }

      const data = (await res.json()) as AuthTokensResponse;
      saveAuthSession(data);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!authStorage.getToken() && !authStorage.getRefreshToken()) {
    throw new Error("Unauthorized");
  }

  const makeInit = (): RequestInit => {
    const headers = new Headers(init.headers);
    const accessToken = authStorage.getToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return { ...init, headers };
  };

  let response = authStorage.getToken()
    ? await fetch(url, makeInit())
    : new Response(null, { status: 401 });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(url, makeInit());
    }
  }

  return response;
}

const saveUserProfile = (user: User) => {
  const normalized = normalizeUser(user);
  authStorage.setUser(normalized);
  return normalized;
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
    const user = await fetchWithAuth(`${getApiBaseUrl()}/auth/me`).then((res) =>
      checkResponse<User>(res),
    );

    return saveUserProfile(user);
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const user = await fetchWithAuth(`${getApiBaseUrl()}/auth/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<User>(res));

    return saveUserProfile(user);
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    await fetchWithAuth(`${getApiBaseUrl()}/auth/me/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<{ success: true }>(res));
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const user = await fetchWithAuth(`${getApiBaseUrl()}/auth/me/avatar`, {
      method: "POST",
      body: formData,
    }).then((res) => checkResponse<User>(res));

    return saveUserProfile(user);
  },
  register: async (
    phone: string,
    password: string,
    phoneCountry?: string,
  ) => {
    const data = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, phoneCountry }),
    }).then((res) => checkResponse<AuthTokensResponse>(res));

    saveAuthSession(data);
  },
};

const optionalAuthHeaders = (): HeadersInit => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = authStorage.getToken();
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
};

export const problems = {
  getProblems: async () => {
    const data = await fetch(`${getApiBaseUrl()}/materials/public`, {
      headers: optionalAuthHeaders(),
    }).then((res) => checkResponse<Problem[]>(res));
    return data;
  },
  getBySlug: async (slug: string) => {
    const data = await fetch(
      `${getApiBaseUrl()}/materials/public/${encodeURIComponent(slug)}`,
      { headers: optionalAuthHeaders() },
    ).then((res) => checkResponse<Material>(res));
    return data;
  },
};

export const knowledge = {
  getArticles: async () => {
    const data = await fetch(`${getApiBaseUrl()}/knowledge/public`).then((res) =>
      checkResponse<KnowledgeArticle[]>(res),
    );
    return data;
  },
  getBySlug: async (slug: string) => {
    const data = await fetch(
      `${getApiBaseUrl()}/knowledge/public/${encodeURIComponent(slug)}`,
    ).then((res) => checkResponse<KnowledgeArticle>(res));
    return data;
  },
};

export type CreateTicketPayload = {
  name: string;
  phone: string;
  message: string;
  source?: "home" | "support" | "cabinet" | "other";
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorType: "user" | "admin";
  authorUserId: string | null;
  body: string;
  createdAt: string;
};

export type TicketResponse = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: "new" | "in_progress" | "closed" | string;
  source: string;
  userId?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  messages?: TicketMessage[];
};

export const tickets = {
  create: async (payload: CreateTicketPayload) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(optionalAuthHeaders() as Record<string, string>),
    };

    return fetch(`${getApiBaseUrl()}/tickets`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }).then((res) => checkResponse<TicketResponse>(res));
  },

  getMine: async () => {
    return fetchWithAuth(`${getApiBaseUrl()}/tickets/me`).then((res) =>
      checkResponse<TicketResponse[]>(res),
    );
  },

  getMineById: async (id: string) => {
    return fetchWithAuth(`${getApiBaseUrl()}/tickets/me/${id}`).then((res) =>
      checkResponse<TicketResponse>(res),
    );
  },

  createMine: async (message: string, name?: string) => {
    return fetchWithAuth(`${getApiBaseUrl()}/tickets/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, name }),
    }).then((res) => checkResponse<TicketResponse>(res));
  },

  sendMineMessage: async (id: string, body: string) => {
    return fetchWithAuth(`${getApiBaseUrl()}/tickets/me/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }).then((res) => checkResponse<TicketMessage>(res));
  },
};

export type PublicTariff = {
  id: string;
  type: string;
  title: string;
  titleColor: string | null;
  price: string;
  priceAmount?: number | null;
  period: string;
  durationDays?: number;
  subTitle: string;
  description: string[];
  image: string;
  imageAlt: string;
  sortOrder: number;
};

export type CreatePaymentResponse = {
  id: string;
  paymentUrl: string;
  status: string;
  expiresIn: string | null;
  amount: number;
  currency: string;
  tariffType: string;
};

export const tariffsApi = {
  getPublic: async () => {
    return fetch(`${getApiBaseUrl()}/tariffs/public`).then((res) =>
      checkResponse<PublicTariff[]>(res),
    );
  },

  getComparisonPublic: async () => {
    return fetch(`${getApiBaseUrl()}/tariffs/comparison/public`).then((res) =>
      checkResponse<PriceComparison>(res),
    );
  },
};

export type SupportLinksResponse = {
  telegram: string;
  vk: string;
  max: string;
};

export const settingsApi = {
  getSupportLinks: async () => {
    return fetch(`${getApiBaseUrl()}/settings/support-links`).then((res) =>
      checkResponse<SupportLinksResponse>(res),
    );
  },
};

export const payments = {
  create: async (tariffType: string) => {
    return fetchWithAuth(`${getApiBaseUrl()}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tariffType }),
    }).then((res) => checkResponse<CreatePaymentResponse>(res));
  },
};
