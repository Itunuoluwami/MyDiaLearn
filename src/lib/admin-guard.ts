import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { isApiConfigured } from "@/lib/api/client";
import { apiGet } from "@/lib/api/data-client";
import { authClient } from "@/lib/auth";
import { portalHome } from "@/lib/portal-home";
import type { AppRole } from "@/hooks/use-auth";

/**
 * Route-level protection for the admin portal.
 *
 * Before this existed, `_authenticated/route.tsx` checked only that a session
 * existed, and every admin page relied on an in-component `hasPermission` gate.
 * That gate is React state: it hides the UI but does not deny the route, so a
 * signed-in parent could load /admin/users and receive the entire admin shell —
 * header, sidebar, all ten section links — before meeting the wall. Data never
 * leaked, because RLS and the `is_admin()` guard on every admin RPC do the real
 * work, but the route itself was open.
 *
 * This closes that. Non-admins are redirected to their own portal and never
 * render admin chrome at all.
 *
 * Deliberately NOT enforced here: individual permissions. A scoped admin who
 * lacks `admin.payouts` still reaches /admin/payouts and gets the existing
 * "Admin access required" card, which explains the situation. Redirecting
 * instead would risk a loop for an admin who also lacks whatever we redirected
 * them to. Coarse check here, fine-grained message in the component.
 */

interface AdminContext {
  userId: string;
  roles: AppRole[];
  isAdmin: boolean;
  mustChangePassword: boolean;
}

/**
 * beforeLoad fires on every navigation within the portal, so the three reads
 * below are cached briefly per user. Short enough that a revoked admin loses
 * access almost immediately; long enough that clicking through the sidebar
 * doesn't re-query on each hop.
 */
const CACHE_TTL_MS = 15_000;
let cache: { key: string; at: number; value: AdminContext } | null = null;

export function clearAdminContextCache() {
  cache = null;
}

async function loadAdminContext(): Promise<AdminContext | null> {
  const {
    data: { user },
  } = await authClient.getUser();
  if (!user) return null;

  if (cache && cache.key === user.id && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }

  let roles: AppRole[];
  let mustChangePassword: boolean;

  if (authClient.provider === "nestjs" && isApiConfigured()) {
    // One call: /users/me carries the roles and the password-change flag.
    const me = await apiGet<{ roles: AppRole[]; mustChangePassword: boolean }>("/users/me");
    roles = me.roles;
    mustChangePassword = me.mustChangePassword === true;
  } else {
    const [{ data: roleRows }, { data: profileRow }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("profiles").select("must_change_password").eq("id", user.id).maybeSingle(),
    ]);
    roles = ((roleRows ?? []) as { role: AppRole }[]).map((row) => row.role);
    mustChangePassword =
      (profileRow as { must_change_password?: boolean } | null)?.must_change_password === true;
  }

  const value: AdminContext = {
    userId: user.id,
    roles,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    mustChangePassword,
  };

  cache = { key: user.id, at: Date.now(), value };
  return value;
}

/**
 * Guard for every /admin/* route.
 *
 * @param options.allowPasswordChangePending
 *   Set on /admin/security itself, which must stay reachable while the flag is
 *   set — otherwise the redirect below would point at a route that redirects
 *   back to itself.
 * @param options.superAdminOnly
 *   Set on /admin/admins, where a plain admin has no business at all.
 */
export function adminBeforeLoad(options?: {
  allowPasswordChangePending?: boolean;
  superAdminOnly?: boolean;
}) {
  return async () => {
    const context = await loadAdminContext();

    if (!context) {
      throw redirect({ to: "/auth" });
    }

    if (!context.isAdmin) {
      throw redirect({ to: portalHome(context.roles) });
    }

    if (options?.superAdminOnly && !context.roles.includes("super_admin")) {
      throw redirect({ to: "/admin/dashboard" });
    }

    // An invited admin arrives with a password somebody else generated. They do
    // not get to work until they have replaced it.
    if (context.mustChangePassword && !options?.allowPasswordChangePending) {
      throw redirect({ to: "/admin/security" });
    }

    return { adminRoles: context.roles };
  };
}
