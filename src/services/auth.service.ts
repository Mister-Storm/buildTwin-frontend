import { getApiBaseUrl } from "@/services/api-client";

type LoginResponse = {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
};

type UserDto = {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  active?: boolean;
};

const TOKEN_KEY = "buildtwin_token";
const REFRESH_KEY = "buildtwin_refresh";
const USER_KEY = "buildtwin_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): LoginResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse["user"];
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

export function hasRole(role: string): boolean {
  const user = getStoredUser();
  return user?.roles.includes(role) ?? false;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const message =
      res.status === 401
        ? "Email ou senha inválidos"
        : `Erro ao autenticar (${res.status})`;
    throw new Error(message);
  }

  const data = (await res.json()) as LoginResponse;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
}

export async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = (await res.json()) as LoginResponse;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return data.token;
  } catch {
    logout();
    return null;
  }
}

// ── Admin API ─────────────────────────────────────────────────────────

async function adminFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getStoredToken();
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/v1/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listUsers(): Promise<UserDto[]> {
  return adminFetch<UserDto[]>("/users");
}

export async function createUser(data: {
  email: string;
  password: string;
  displayName?: string;
  roles?: string[];
}): Promise<UserDto> {
  return adminFetch<UserDto>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function toggleUserActive(userId: string): Promise<void> {
  return adminFetch<void>(`/users/${userId}/toggle-active`, {
    method: "PATCH",
  });
}

export async function updateUserRoles(
  userId: string,
  roleIds: string[],
): Promise<void> {
  return adminFetch<void>(`/users/${userId}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roleIds }),
  });
}
