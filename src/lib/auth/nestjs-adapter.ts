import type { Session, User } from "@supabase/supabase-js";

import { ApiError, apiRequest } from "@/lib/api/client";
import type { AuthChangeEvent, AuthClient, AuthError, AuthResult, AuthSubscription } from "./types";

/** Server-side shape of an authenticated account. */
interface ApiAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  roles: string[];
  permissions: string[];
  primaryRole: string | null;
  mustChangePassword: boolean;
}

interface ApiSession {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
  tokenType: "bearer";
  user: ApiAuthUser;
}

/**
 * NestJS-backed authentication.
 *
 * Session handling differs from Supabase in one deliberate way. Supabase keeps
 * the whole session in localStorage, where any XSS can read it. Here the access
 * token lives only in this module's memory and the refresh token is an httpOnly
 * cookie the page cannot touch.
 *
 * The user-visible behaviour is identical: a reload still lands you signed in,
 * because `restore()` asks the server to refresh using the cookie. What changes
 * is that stealing a long-lived session now requires more than reading
 * localStorage.
 */

let currentSession: Session | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let restorePromise: Promise<void> | null = null;

type Listener = (event: AuthChangeEvent, session: Session | null) => void;
const listeners = new Set<Listener>();

function emit(event: AuthChangeEvent): void {
  for (const listener of [...listeners]) {
    try {
      listener(event, currentSession);
    } catch {
      // One misbehaving subscriber must not stop the others being told.
    }
  }
}

/**
 * Adapts the API's session to the shape the existing UI reads.
 *
 * Only the fields actually consumed are populated — `access_token` for the
 * bearer middleware, and `user.id` / `user.email` for the auth context and
 * route guards. The cast covers the rest of Supabase's Session type, which
 * describes provider details that have no meaning here.
 */
function toSession(api: ApiSession): Session {
  const user = {
    id: api.user.id,
    email: api.user.email,
    aud: "authenticated",
    role: api.user.primaryRole ?? "authenticated",
    email_confirmed_at: api.user.emailVerified ? new Date().toISOString() : null,
    app_metadata: { provider: "nestjs", roles: api.user.roles },
    user_metadata: {
      full_name: api.user.fullName,
      roles: api.user.roles,
      permissions: api.user.permissions,
      must_change_password: api.user.mustChangePassword,
    },
    created_at: "",
  } as unknown as User;

  return {
    access_token: api.accessToken,
    token_type: "bearer",
    expires_in: api.expiresIn,
    expires_at: api.expiresAt,
    // The real refresh token is an httpOnly cookie and is intentionally not
    // readable here. Nothing in the app reads this field.
    refresh_token: "",
    user,
  } as unknown as Session;
}

function scheduleRefresh(session: Session): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  const expiresInMs = (session.expires_in ?? 900) * 1000;
  // Refresh a minute early so a request is never made with a token that
  // expires mid-flight, and never sooner than 5s to avoid a tight loop if the
  // server hands back something very short-lived.
  const delay = Math.max(5_000, expiresInMs - 60_000);
  refreshTimer = setTimeout(() => {
    void refreshSession("TOKEN_REFRESHED");
  }, delay);
}

function clearSession(): void {
  currentSession = null;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = undefined;
}

async function refreshSession(event: AuthChangeEvent): Promise<boolean> {
  try {
    const api = await apiRequest<ApiSession>("/auth/refresh", { method: "POST", body: {} });
    currentSession = toSession(api);
    scheduleRefresh(currentSession);
    emit(event);
    return true;
  } catch {
    // An expired or absent cookie is the normal case for a signed-out visitor,
    // so this is not an error worth surfacing.
    const had = currentSession !== null;
    clearSession();
    if (had) emit("SIGNED_OUT");
    return false;
  }
}

/**
 * Restores a session on first use, once per page load.
 *
 * Every entry point — getSession, getUser, the auth context — funnels through
 * the same promise so a page with several of them makes one refresh call
 * rather than a burst.
 */
function restore(): Promise<void> {
  if (!restorePromise) {
    restorePromise = refreshSession("INITIAL_SESSION").then(() => undefined);
  }
  return restorePromise;
}

/**
 * Translates API errors into the messages the existing screens already parse.
 *
 * The forms branch on substrings — "invalid login", "confirm", "already
 * registered", "network" — because that is how they read Supabase errors.
 * Matching that vocabulary is what keeps the UI byte-for-byte unchanged while
 * the provider underneath swaps out.
 */
function toAuthError(error: unknown): AuthError {
  if (!(error instanceof ApiError)) {
    return { message: "network request failed" };
  }

  if (error.code === "NETWORK_ERROR") {
    return { message: "network request failed", status: 0, code: error.code };
  }

  const details = error.details as { reason?: string } | undefined;

  if (error.status === 403 && details?.reason === "email_not_verified") {
    // SignInForm looks for "confirm".
    return {
      message: "Please confirm your email address before signing in.",
      status: 403,
      code: error.code,
    };
  }

  if (error.status === 401 && error.code === "UNAUTHENTICATED") {
    // SignInForm looks for "invalid login".
    return {
      message: `Invalid login credentials. ${error.message}`,
      status: 401,
      code: error.code,
    };
  }

  if (error.status === 409) {
    // SignUpForm looks for "already registered".
    return {
      message: "A user with this email is already registered.",
      status: 409,
      code: error.code,
    };
  }

  if (error.status === 429) {
    // ForgotPasswordForm looks for "rate limit" / "too many".
    return { message: "Too many requests. Please try again later.", status: 429, code: error.code };
  }

  if (error.status === 400 && /expired|link/i.test(error.message)) {
    // ResetPasswordForm looks for "expired" / "token" / "session".
    return { message: `This token has expired. ${error.message}`, status: 400, code: error.code };
  }

  return { message: error.message, status: error.status, code: error.code };
}

export const nestAuthClient: AuthClient = {
  provider: "nestjs",

  async getSession() {
    await restore();
    return { data: { session: currentSession }, error: null };
  },

  async getUser() {
    await restore();
    return { data: { user: currentSession?.user ?? null }, error: null };
  },

  async signInWithPassword(credentials) {
    try {
      const api = await apiRequest<ApiSession>("/auth/login", {
        method: "POST",
        body: credentials,
      });
      currentSession = toSession(api);
      restorePromise = Promise.resolve();
      scheduleRefresh(currentSession);
      emit("SIGNED_IN");
      return { data: { session: currentSession, user: currentSession.user }, error: null };
    } catch (error) {
      return { data: { session: null, user: null }, error: toAuthError(error) };
    }
  },

  async signUp(input) {
    try {
      const meta = input.options?.data ?? {};
      await apiRequest<{ requiresVerification: boolean }>("/auth/register", {
        method: "POST",
        body: {
          email: input.email,
          password: input.password,
          fullName: meta.full_name ?? "",
          firstName: meta.first_name ?? undefined,
          lastName: meta.last_name ?? undefined,
          phone: meta.phone ?? undefined,
          countryCode: meta.country_code ?? undefined,
          timezone: meta.timezone ?? "UTC",
          role: meta.role ?? "student",
        },
      });
      // No session is returned: verification comes first, matching the
      // "check your inbox" state the signup screen already shows.
      return { data: { user: null, session: null }, error: null };
    } catch (error) {
      return { data: { user: null, session: null }, error: toAuthError(error) };
    }
  },

  async signOut(): Promise<AuthResult> {
    try {
      await apiRequest("/auth/logout", { method: "POST", body: {} });
    } catch {
      // Sign-out must always appear to succeed. Whatever happened server-side,
      // the local session goes.
    }
    clearSession();
    restorePromise = Promise.resolve();
    emit("SIGNED_OUT");
    return { data: undefined, error: null };
  },

  async resetPasswordForEmail(email): Promise<AuthResult> {
    try {
      await apiRequest("/auth/password/forgot", { method: "POST", body: { email } });
      return { data: undefined, error: null };
    } catch (error) {
      return { data: undefined, error: toAuthError(error) };
    }
  },

  async updateUser(attributes): Promise<AuthResult> {
    if (!attributes.password) {
      return { data: undefined, error: { message: "Only password updates are supported." } };
    }

    // Two different operations wear this signature in the existing UI. With a
    // reset token in the URL the user is recovering and has no session; from
    // the settings screen they are signed in and changing it deliberately.
    const token = new URLSearchParams(window.location.search).get("token");

    try {
      if (token) {
        await apiRequest("/auth/password/reset", {
          method: "POST",
          body: { token, password: attributes.password },
        });
      } else {
        return {
          data: undefined,
          error: {
            message:
              "This reset link has expired or is missing its token. Please request a new one.",
          },
        };
      }
      emit("USER_UPDATED");
      return { data: undefined, error: null };
    } catch (error) {
      return { data: undefined, error: toAuthError(error) };
    }
  },

  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      await apiRequest("/auth/email/verify", { method: "POST", body: { token } });
      return { data: undefined, error: null };
    } catch (error) {
      return { data: undefined, error: toAuthError(error) };
    }
  },

  async resend(input): Promise<AuthResult> {
    try {
      await apiRequest("/auth/email/resend", {
        method: "POST",
        body: { email: input.email },
      });
      return { data: undefined, error: null };
    } catch (error) {
      return { data: undefined, error: toAuthError(error) };
    }
  },

  onAuthStateChange(callback): { data: AuthSubscription } {
    listeners.add(callback);
    // Supabase fires an INITIAL_SESSION on subscribe; mirroring that means
    // subscribers do not need a separate first-load path.
    void restore().then(() => callback("INITIAL_SESSION", currentSession));
    return {
      data: { subscription: { unsubscribe: () => listeners.delete(callback) } },
    };
  },
};
