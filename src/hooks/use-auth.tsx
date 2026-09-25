import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/lib/auth";
import { governanceRpc } from "@/integrations/supabase/governance-types";
import type { Database } from "@/integrations/supabase/types";

/**
 * `super_admin` was added to the enum in 20260907090000 but `types.ts` has not
 * been regenerated since, so it is unioned in here to keep role checks honest.
 */
export type AppRole = Database["public"]["Enums"]["app_role"] | "super_admin";
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
const API_BASE = (import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/+$/, "");

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

  const loadIdentity = useCallback(async (session: Session | null) => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      setRoles([]);
      setPermissions([]);
      return;
    }

    // When the NestJS provider is active it has already resolved roles and
    // permissions server-side — through the same my_permissions() the browser
    // used to call — and carries them on the session. Trusting that avoids a
    // second round trip and, more importantly, avoids reading user_roles from
    // Supabase for an account that only exists in DiaLearn's own database.
    const claims = session?.user.user_metadata as
      { roles?: string[]; permissions?: string[] } | undefined;

    if (authClient.provider === "nestjs") {
      // Fetch the profile, roles and permissions from the API in one call.
      // /users/me resolves permissions through the same my_permissions() the
      // Supabase path used, so the two providers produce the same identity —
      // and the account screen renders real fields rather than blanks.
      try {
        const me = await fetchCurrentUser(session);
        setProfile(me.profile);
        setRoles(me.roles);
        setPermissions(me.permissions);
      } catch {
        // Fall back to the token claims, so a transient API blip degrades to a
        // usable session (correct roles, empty profile) rather than a logout.
        setProfile(null);
        setRoles((claims?.roles ?? []) as AppRole[]);
        setPermissions(claims?.permissions ?? []);
      }
      return;
    }

    const [{ data: profileRow }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const nextRoles = (roleRows ?? []).map((row) => row.role);
    setProfile(profileRow ?? null);
    setRoles(nextRoles);

    if (nextRoles.length === 0) {
      setPermissions([]);
      return;
    }

    // Resolved server-side rather than by reading role_permissions here: the
    // browser cannot see per-user overrides in user_permissions, and cannot
    // know that a super admin implicitly holds every permission.
    try {
      const resolved = await governanceRpc<string[]>("my_permissions");
      setPermissions(resolved ?? []);
    } catch {
      // my_permissions() ships with the 20260907* migrations. Until they are
      // applied, fall back to the role-level set so the portal keeps working.
      const { data: permissionRows } = await supabase
        .from("role_permissions")
        .select("permission_key")
        .in("role", nextRoles);
      setPermissions([...new Set((permissionRows ?? []).map((row) => row.permission_key))]);
    }
  }, []);

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
    await loadIdentity(data.session);
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
