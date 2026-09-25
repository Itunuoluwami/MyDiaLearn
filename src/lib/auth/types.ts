import type { Session, User } from "@supabase/supabase-js";

/**
 * The authentication surface the application uses.
 *
 * Deliberately shaped like `supabase.auth`. The point of this phase is to make
 * the provider swappable *without* touching a single screen, and the cheapest
 * way to do that is to keep the call signatures the UI already uses. Every form
 * changes one import and nothing else.
 *
 * Errors are returned, not thrown, for the same reason: the existing forms all
 * branch on `{ error }` and inspect `error.message`.
 */
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export type AuthResult<T = undefined> = { data: T; error: AuthError | null };

export interface SignUpMetadata {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country_code?: string;
  role?: string;
  timezone?: string;
}

export type AuthChangeEvent =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export interface AuthSubscription {
  subscription: { unsubscribe: () => void };
}

export interface AuthClient {
  getSession(): Promise<AuthResult<{ session: Session | null }>>;
  getUser(): Promise<AuthResult<{ user: User | null }>>;

  signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResult<{ session: Session | null; user: User | null }>>;

  signUp(input: {
    email: string;
    password: string;
    options?: { data?: SignUpMetadata; emailRedirectTo?: string };
  }): Promise<AuthResult<{ user: User | null; session: Session | null }>>;

  signOut(): Promise<AuthResult>;

  resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<AuthResult>;

  /** Password change for an already-authenticated or recovering session. */
  updateUser(attributes: { password?: string; email?: string }): Promise<AuthResult>;

  resend(input: { type: "signup"; email: string }): Promise<AuthResult>;

  /**
   * Confirms an email address from a verification token.
   *
   * Only the NestJS provider receives a token in the app URL (`?verify=`).
   * Supabase confirms on its own hosted page, so under that provider this is a
   * no-op and the app never calls it with a token.
   */
  verifyEmail(token: string): Promise<AuthResult>;

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): {
    data: AuthSubscription;
  };

  /** Which implementation is active. Useful in diagnostics and tests. */
  readonly provider: "supabase" | "nestjs";
}
