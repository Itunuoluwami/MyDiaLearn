import type { AppRole } from "@/hooks/use-auth";

/**
 * Landing route for a signed-in account, based on their role(s).
 * Portals that are not built yet fall back to the shared account page.
 */
const ROLE_HOME: Partial<Record<AppRole, string>> = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  parent: "/dashboard",
  tutor: "/tutor/dashboard",
  student: "/student/dashboard",
  agency: "/agency/dashboard",
};

export function portalHome(roles: AppRole[]): string {
  for (const role of roles) {
    const home = ROLE_HOME[role];
    if (home) return home;
  }
  return "/account";
}
