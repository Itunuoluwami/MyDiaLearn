import { supabase } from "@/integrations/supabase/client";
import type {
  AuthChangeEvent,
  AuthClient,
  AuthError,
  AuthResult,
  AuthSubscription,
  SignUpMetadata,
} from "./types";
import type { AuthError as SupabaseAuthError, Session, User } from "@supabase/supabase-js";

/**
 * Supabase's AuthError is a class with optional members typed as
 * `number | undefined`, which does not satisfy a structural `status?: number`
 * under exactOptionalPropertyTypes. Narrowing it here keeps the adapter
 * boundary honest instead of loosening the shared interface for every provider.
 */
function toAuthError(error: SupabaseAuthError | null): AuthError | null {
  if (!error) return null;
  return {
    message: error.message,
    ...(error.status !== undefined ? { status: error.status } : {}),
    ...(error.code !== undefined ? { code: error.code } : {}),
  };
}

/**
 * The incumbent. Delegates straight to supabase-js.
 *
 * Kept as the default until the NestJS flow is verified in each environment —
 * migration rule 7 forbids removing working authentication before its
 * replacement is proven. Deleting this file is the last step of the auth
 * migration, not the first.
 */
export const supabaseAuthClient: AuthClient = {
  provider: "supabase",

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data: { session: data.session }, error: toAuthError(error ?? null) };
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data: { user: data.user }, error: toAuthError(error ?? null) };
  },

  async signInWithPassword(credentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    return { data: { session: data.session, user: data.user }, error: toAuthError(error ?? null) };
  },

  async signUp(input) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      ...(input.options
        ? {
            options: {
              ...(input.options.data ? { data: input.options.data as SignUpMetadata } : {}),
              ...(input.options.emailRedirectTo
                ? { emailRedirectTo: input.options.emailRedirectTo }
                : {}),
            },
          }
        : {}),
    });
    return { data: { user: data.user, session: data.session }, error: toAuthError(error ?? null) };
  },

  async signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut();
    return { data: undefined, error: toAuthError(error ?? null) };
  },

  async resetPasswordForEmail(email, options): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      options?.redirectTo ? { redirectTo: options.redirectTo } : undefined,
    );
    return { data: undefined, error: toAuthError(error ?? null) };
  },

  async updateUser(attributes): Promise<AuthResult> {
    const { error } = await supabase.auth.updateUser(attributes);
    return { data: undefined, error: toAuthError(error ?? null) };
  },

  async verifyEmail(): Promise<AuthResult> {
    // Supabase confirms via its own hosted link and detectSessionInUrl; the app
    // never receives a ?verify= token under this provider, so nothing to do.
    return { data: undefined, error: null };
  },

  async resend(input): Promise<AuthResult> {
    const { error } = await supabase.auth.resend({ type: input.type, email: input.email });
    return { data: undefined, error: toAuthError(error ?? null) };
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): {
    data: AuthSubscription;
  } {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event as AuthChangeEvent, session);
    });
    return { data: { subscription: { unsubscribe: () => data.subscription.unsubscribe() } } };
  },
};

export type { Session, User };
