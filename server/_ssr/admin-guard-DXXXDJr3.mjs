import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { t as portalHome } from "./portal-home-BO3OTxAy.mjs";
import { N as redirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as apiGet } from "./data-client-kVSxwzg_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-guard-DXXXDJr3.js
/**
* beforeLoad fires on every navigation within the portal, so the three reads
* below are cached briefly per user. Short enough that a revoked admin loses
* access almost immediately; long enough that clicking through the sidebar
* doesn't re-query on each hop.
*/
var CACHE_TTL_MS = 15e3;
var cache = null;
function clearAdminContextCache() {
	cache = null;
}
async function loadAdminContext() {
	const { data: { user } } = await authClient.getUser();
	if (!user) return null;
	if (cache && cache.key === user.id && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
	const me = await apiGet("/users/me");
	const roles = me.roles;
	const mustChangePassword = me.mustChangePassword === true;
	const value = {
		userId: user.id,
		roles,
		isAdmin: roles.includes("admin") || roles.includes("super_admin"),
		mustChangePassword
	};
	cache = {
		key: user.id,
		at: Date.now(),
		value
	};
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
function adminBeforeLoad(options) {
	return async () => {
		const context = await loadAdminContext();
		if (!context) throw redirect({ to: "/auth" });
		if (!context.isAdmin) throw redirect({ to: portalHome(context.roles) });
		if (options?.superAdminOnly && !context.roles.includes("super_admin")) throw redirect({ to: "/admin/dashboard" });
		if (context.mustChangePassword && !options?.allowPasswordChangePending) throw redirect({ to: "/admin/security" });
		return { adminRoles: context.roles };
	};
}
//#endregion
export { clearAdminContextCache as n, adminBeforeLoad as t };
