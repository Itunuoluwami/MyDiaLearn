import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AuthUser as User, Session } from "@/lib/auth/types";
import type { AppRole } from "@/lib/domain-types";
import type { ProfilesRow } from "@/lib/database-types";

import { authClient } from "@/lib/auth";

export type { AppRole } from "@/lib/domain-types";
export type Profile = ProfilesRow;

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  permissions: string[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  /** Top tier: may invite admins and assign roles and permissions. */
  isSuperAdmin: boolean;
  /** True for admin and super_admin alike, mirroring the DB's is_admin(). */
  isAdmin: boolean;
  /** Set when an invited admin has not yet replaced their issued password. */
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
}

/**
 * Reads the caller's identity from the NestJS API.
 *
 * Shapes the response into the same `Profile` the Supabase path produces, so
 * every consumer of AuthContext — the account screen, the portal guards — works
 * unchanged whichever provider is active.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

interface ApiCurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  countryCode: string | null;
  timezone: string;
  preferredCurrency: string;
  primaryRole: string;
  onboardingCompleted: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
}

async function fetchCurrentUser(
  session: Session | null,
): Promise<{ profile: Profile; roles: AppRole[]; permissions: string[] }> {
  const token = session?.access_token;
  const response = await fetch(`${API_BASE}/users/me`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`users/me returned ${response.status}`);
  const me = (await response.json()) as ApiCurrentUser;

  // Map the API's camelCase onto the snake_case Profile row shape the UI reads.
  const profile = {
    id: me.id,
    email: me.email,
    full_name: me.fullName,
    phone: me.phone,
    avatar_url: me.avatarUrl,
    country_code: me.countryCode,
    timezone: me.timezone,
    preferred_currency: me.preferredCurrency,
    primary_role: me.primaryRole,
    onboarding_completed: me.onboardingCompleted,
    is_active: me.isActive,
    must_change_password: me.mustChangePassword,
  } as unknown as Profile;

  return { profile, roles: me.roles as AppRole[], permissions: me.permissions };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * The identity fetch in flight, keyed by the user it is for.
   *
   * Mounting the provider announces the session three times — `getSession()`
   * resolves it, subscribing replays `INITIAL_SESSION`, and the restore that
   * woke both of them emits it again — and each announcement used to trigger
   * its own `/users/me`. Three identical requests is wasteful anywhere and
   * costs about five seconds against a hosted database. Sharing one promise
   * per user collapses them into a single call; `refresh()` passes `force` to
   * deliberately go again.
   */
  const identityRef = useRef<{ userId: string; promise: Promise<void> } | null>(null);

  const loadIdentity = useCallback(
    async (session: Session | null, options?: { force?: boolean }): Promise<void> => {
      const userId = session?.user.id;
      if (!userId) {
        identityRef.current = null;
        setProfile(null);
        setRoles([]);
        setPermissions([]);
        return;
      }

      const inFlight = identityRef.current;
      if (!options?.force && inFlight?.userId === userId) return inFlight.promise;

      // When the NestJS provider is active it has already resolved roles and
      // permissions server-side — through the same my_permissions() the browser
      // used to call — and carries them on the session. Trusting that avoids a
      // second round trip and, more importantly, avoids reading user_roles from
      // Supabase for an account that only exists in DiaLearn's own database.
      const claims = session?.user.user_metadata as
        { roles?: string[]; permissions?: string[] } | undefined;

      // Profile, roles and permissions in one call. /users/me resolves
      // permissions through my_permissions(), so the account screen renders
      // real fields rather than blanks.
      const promise = (async () => {
        try {
          const me = await fetchCurrentUser(session);
          setProfile(me.profile);
          setRoles(me.roles);
          setPermissions(me.permissions);
        } catch {
          // Fall back to the token claims, so a transient API blip degrades to a
          // usable session (correct roles, empty profile) rather than a logout.
          // The cache is dropped so the next announcement may try again.
          identityRef.current = null;
          setProfile(null);
          setRoles((claims?.roles ?? []) as AppRole[]);
          setPermissions(claims?.permissions ?? []);
        }
      })();

      identityRef.current = { userId, promise };
      return promise;
    },
    [],
  );

  useEffect(() => {
    let active = true;

    authClient.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadIdentity(data.session);
      if (active) setLoading(false);
    });

    const { data: subscription } = authClient.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        void loadIdentity(nextSession);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadIdentity]);

  const refresh = useCallback(async () => {
    const { data } = await authClient.getSession();
    setSession(data.session);
    await loadIdentity(data.session, { force: true });
  }, [loadIdentity]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      roles,
      permissions,
      loading,
      hasRole: (role) => roles.includes(role),
      hasAnyRole: (list) => list.some((role) => roles.includes(role)),
      hasPermission: (permission) => permissions.includes(permission),
      isSuperAdmin: roles.includes("super_admin"),
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      mustChangePassword:
        (profile as (Profile & { must_change_password?: boolean }) | null)?.must_change_password ===
          true ||
        (session?.user.user_metadata as { must_change_password?: boolean } | undefined)
          ?.must_change_password === true,
      refresh,
    }),
    [session, profile, roles, permissions, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
