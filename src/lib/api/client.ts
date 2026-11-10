/**
 * Typed fetch wrapper for the NestJS API.
 *
 * Two jobs beyond `fetch`:
 *
 *  1. `credentials: "include"`, so the httpOnly refresh cookie travels. Without
 *     it the browser silently omits the cookie cross-origin and every refresh
 *     fails in a way that looks like an expired session.
 *  2. Normalising the backend's error envelope into something the UI can read.
 */

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Origin AND prefix of the NestJS API, e.g. http://localhost:3000/api.
 *
 * The prefix belongs in the variable rather than in each call, because
 * API_PREFIX is configurable on the backend — hardcoding "/api" here would
 * break the moment someone changed it.
 */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

/** Trailing slashes produce `//api/...`, which some proxies treat as a new path. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Access token, when the caller holds one. */
  accessToken?: string | null;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  // A FormData body (file upload) sets its own multipart boundary header.
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      // Carries the refresh cookie. Required for /auth/refresh and /auth/logout.
      credentials: "include",
      headers: {
        ...(options.body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      ...(options.body !== undefined
        ? { body: isForm ? (options.body as FormData) : JSON.stringify(options.body) }
        : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (cause) {
    // A transport failure is not an authentication failure, and the forms
    // distinguish them — they look for "network" or "fetch" in the message.
    throw new ApiError(0, "NETWORK_ERROR", "network request failed", cause);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeJson(text) : undefined;

  if (!response.ok) {
    const body = payload as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      body?.code ?? "HTTP_ERROR",
      body?.message ?? `Request failed with status ${response.status}`,
      body?.details,
      body?.requestId,
    );
  }

  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
