import { Platform } from "react-native";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor({ status, message, code, details }: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
  }) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const API_BASE_URL = Platform.select({
  ios: "https://mafiax-44op.onrender.com/api",
  android: "https://mafiax-44op.onrender.com/api",
  web: "https://mafiax-44op.onrender.com/api",
  default: "https://mafiax-44op.onrender.com/api",
}) ?? "https://mafiax-44op.onrender.com/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const SOCKET_PATH = "/api/socket.io";

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers ?? {}),
  };

  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const body = payload && typeof payload === "object" ? payload : null;
    const message =
      body && "error" in body
        ? String((body as Record<string, unknown>).error)
        : response.statusText;
    const code =
      body && "code" in body
        ? String((body as Record<string, unknown>).code)
        : undefined;
    throw new ApiError({
      status: response.status,
      message,
      code,
      details: payload,
    });
  }

  return payload as T;
}
