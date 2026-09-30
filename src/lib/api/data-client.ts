import { API_BASE_URL, apiRequest, isApiConfigured } from "./client";
import { authClient } from "@/lib/auth";

/**
 * Whether the frontend's data reads should go to the NestJS API.
 *
 * True when the app is running on the nestjs auth provider AND the API base URL
 * is configured. When false, the data hooks fall back to Supabase — so a
 * deployment can still be flipped back by env alone, and nothing hard-depends
 * on the API being reachable at build time.
 */
export function useApiData(): boolean {
  return authClient.provider === "nestjs" && isApiConfigured();
}

/**
 * GET a public or authenticated endpoint, attaching the access token when the
 * caller has a session. Public catalogue routes work without one.
 */
export async function apiGet<T>(path: string): Promise<T> {
  let accessToken: string | null = null;
  try {
    const { data } = await authClient.getSession();
    accessToken = data.session?.access_token ?? null;
  } catch {
    // No session — fine for public reads.
  }
  return apiRequest<T>(path, accessToken ? { accessToken } : {});
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let accessToken: string | null = null;
  try {
    const { data } = await authClient.getSession();
    accessToken = data.session?.access_token ?? null;
  } catch {
    /* public */
  }
  return apiRequest<T>(path, { method: "POST", body, ...(accessToken ? { accessToken } : {}) });
}

/** Re-exported so hooks can build absolute URLs without a second import. */
export { API_BASE_URL };

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  let accessToken: string | null = null;
  try {
    const { data } = await authClient.getSession();
    accessToken = data.session?.access_token ?? null;
  } catch {
    /* public */
  }
  return apiRequest<T>(path, { method: "PATCH", body, ...(accessToken ? { accessToken } : {}) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  let accessToken: string | null = null;
  try {
    const { data } = await authClient.getSession();
    accessToken = data.session?.access_token ?? null;
  } catch {
    /* public */
  }
  return apiRequest<T>(path, { method: "DELETE", ...(accessToken ? { accessToken } : {}) });
}

/** What POST /files/<kind> returns: the key to register with the owning record. */
export interface UploadedFile {
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number;
}

/**
 * Uploads one file to the API's storage. The server picks the key; the caller
 * then creates the record that points at it, as with Supabase storage.
 */
export async function apiUpload(
  kind: "tutor-documents" | "learning-resources" | "submissions",
  file: File,
): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);
  return apiPost<UploadedFile>(`/files/${kind}`, form);
}

/**
 * Opens a stored file in a new tab through a short-lived signed link.
 *
 * The tab is opened before the request so popup blockers still see a direct
 * response to the click; it is pointed at the link once the API has checked
 * access.
 */
export async function openApiFile(urlEndpoint: string): Promise<void> {
  const tab = typeof window !== "undefined" ? window.open("", "_blank") : null;
  try {
    const { url } = await apiGet<{ url: string }>(urlEndpoint);
    const absolute = new URL(url, API_BASE_URL || window.location.origin).toString();
    if (tab) {
      tab.opener = null;
      tab.location.href = absolute;
    } else {
      window.open(absolute, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
}

/**
 * Marker for a file held by the API. Rows from the API carry no storage key,
 * so screens that test `storage_path` for "has a file" get this in its place,
 * and the open/delete helpers recognise it. Never sent to the server.
 */
export const API_FILE_PREFIX = "api-file:";
