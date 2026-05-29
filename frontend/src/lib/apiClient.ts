import { useAuthStore } from "../store/authStore";

export type ApiError = Error & { status?: number };

function parseDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === "object" && item && "msg" in item ? String((item as { msg: string }).msg) : ""))
      .filter(Boolean)
      .join(", ");
  }
  return "Request failed";
}

export function resolveApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const explicit = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (explicit) {
    return `${explicit.replace(/\/$/, "")}${p}`;
  }
  if (import.meta.env.DEV) {
    return `/api${p}`;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000${p}`;
  }
  return `http://127.0.0.1:8000${p}`;
}

function withAuth(init?: RequestInit): RequestInit {
  const token = useAuthStore.getState().token;
  if (!token) return init ?? {};
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(path);
  const res = await fetch(url, withAuth(init));
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? parseDetail((data as { detail: unknown }).detail)
        : res.statusText || `HTTP ${res.status}`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const apiClient = {
  async get<T>(path: string, init?: RequestInit): Promise<T> {
    return requestJson<T>(path, { method: "GET", ...init });
  },

  async post<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return requestJson<T>(path, {
      ...init,
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  },

  async patch<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return requestJson<T>(path, {
      ...init,
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  },

  async delete<T>(path: string, init?: RequestInit): Promise<T> {
    return requestJson<T>(path, { method: "DELETE", ...init });
  },
};
