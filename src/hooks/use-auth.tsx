import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdentity = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      setPermissions([]);
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

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadIdentity(data.session?.user.id);
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void loadIdentity(nextSession?.user.id);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadIdentity]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadIdentity(data.session?.user.id);
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
        true,
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
