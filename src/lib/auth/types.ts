/**
 * The authenticated account.
 *
 * Declared here rather than imported from a vendor SDK: this is DiaLearn's own
 * session shape, and the app should not take its core identity type from a
 * client it no longer uses. The snake_case field names are kept because every
 * screen already reads them.
 */
export interface AuthUser {
  id: string;
  email: string;
  aud: string;
  role: string;
  email_confirmed_at: string | null;
  app_metadata: { provider: string; roles: string[] };
  user_metadata: {
    full_name: string | null;
    roles: string[];
    permissions: string[];
    must_change_password: boolean;
  };
  created_at: string;
}

export interface Session {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  /** Epoch seconds. */
  expires_at: number;
  /**
   * Always empty. The real refresh token is an httpOnly cookie the page
   * cannot read; the field exists because callers destructure it.
   */
  refresh_token: string;
  user: AuthUser;
}

/** Retained so existing call sites keep compiling. */
export type User = AuthUser;

/**
 * The authentication surface the application uses.
 *
 * The call signatures were originally modelled on `supabase.auth` so the
 * provider could be swapped without touching a screen. That swap is done; the
 * shape is kept because it is what every form already speaks.
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
  readonly provider: "nestjs";
}
