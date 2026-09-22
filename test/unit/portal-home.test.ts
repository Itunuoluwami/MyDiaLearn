import { describe, expect, it } from "vitest";

import { portalHome } from "@/lib/portal-home";
import type { AppRole } from "@/hooks/use-auth";

/**
 * portalHome() decides where a signed-in account lands. adminBeforeLoad()
 * redirects non-admins through it, so a wrong answer here is a redirect loop,
 * not a cosmetic bug. Pinning the precedence before the NestJS port moves
 * role resolution out of the browser.
 */
describe("portalHome", () => {
  it.each([
    [["super_admin"], "/admin/dashboard"],
    [["admin"], "/admin/dashboard"],
    [["parent"], "/dashboard"],
    [["tutor"], "/tutor/dashboard"],
    [["student"], "/student/dashboard"],
  ])("routes %s to %s", (roles, expected) => {
    expect(portalHome(roles as AppRole[])).toBe(expected);
  });

  it("falls back to /account when the account has no roles", () => {
    expect(portalHome([])).toBe("/account");
  });

  it("falls back to /account for a role with no portal built yet", () => {
    // `agency` exists in the app_role enum and in signup, but has no UI.
    expect(portalHome(["agency"] as AppRole[])).toBe("/account");
  });

  it("honours array order, not role seniority, for multi-role accounts", () => {
    // Documents current behaviour: the first role wins. A tutor who is also an
    // admin lands wherever their roles happen to be ordered by the query.
    expect(portalHome(["tutor", "admin"] as AppRole[])).toBe("/tutor/dashboard");
    expect(portalHome(["admin", "tutor"] as AppRole[])).toBe("/admin/dashboard");
  });

  it("skips unrecognised roles to reach the first known one", () => {
    expect(portalHome(["agency", "tutor"] as AppRole[])).toBe("/tutor/dashboard");
  });
});
