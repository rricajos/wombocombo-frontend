import { authStore } from "$lib/stores/auth.svelte";

const API_BASE = "/api";

export interface ApiError {
  error: string;
  details?: string;
}

export class ApiRequestError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.error);
    this.status = status;
    this.body = body;
  }
}

async function refreshTokenIfNeeded(): Promise<boolean> {
  if (!authStore.refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: authStore.refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    authStore.updateToken(data.data.token);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authStore.token) {
    headers["Authorization"] = `Bearer ${authStore.token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && authStore.refreshToken) {
    const refreshed = await refreshTokenIfNeeded();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${authStore.token}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "request failed" }));
    throw new ApiRequestError(res.status, body);
  }

  return res.json();
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}
