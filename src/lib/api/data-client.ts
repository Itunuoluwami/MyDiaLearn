import { API_BASE_URL, apiRequest, isApiConfigured } from "./client";
import { authClient } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

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

/** Re-exported so hooks can branch without importing three modules. */
export { API_BASE_URL, supabase };
