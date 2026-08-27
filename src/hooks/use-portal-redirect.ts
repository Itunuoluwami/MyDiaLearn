import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/hooks/use-auth";
import { portalHome } from "@/lib/portal-home";

/**
 * Generic account pages are only for accounts without a dedicated portal.
 * Anyone whose role maps to a portal (e.g. parents) is sent there instead.
 */
export function useRedirectToPortalHome() {
  const { roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const home = portalHome(roles);
    if (home !== "/account") void navigate({ to: home, replace: true });
  }, [loading, roles, navigate]);
}
