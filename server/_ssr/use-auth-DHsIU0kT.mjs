import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-DHsIU0kT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Reads the caller's identity from the NestJS API.
*
* Shapes the response into the same `Profile` the Supabase path produces, so
* every consumer of AuthContext — the account screen, the portal guards — works
* unchanged whichever provider is active.
*/
var API_BASE = "".replace(/\/+$/, "");
async function fetchCurrentUser(session) {
	const token = session?.access_token;
	const response = await fetch(`${API_BASE}/users/me`, {
		credentials: "include",
		headers: token ? { Authorization: `Bearer ${token}` } : {}
	});
	if (!response.ok) throw new Error(`users/me returned ${response.status}`);
	const me = await response.json();
	return {
		profile: {
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
			must_change_password: me.mustChangePassword
		},
		roles: me.roles,
		permissions: me.permissions
	};
}
var AuthContext = (0, import_react.createContext)(void 0);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [permissions, setPermissions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
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
	const identityRef = (0, import_react.useRef)(null);
	const loadIdentity = (0, import_react.useCallback)(async (session, options) => {
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
		const claims = session?.user.user_metadata;
		const promise = (async () => {
			try {
				const me = await fetchCurrentUser(session);
				setProfile(me.profile);
				setRoles(me.roles);
				setPermissions(me.permissions);
			} catch {
				identityRef.current = null;
				setProfile(null);
				setRoles(claims?.roles ?? []);
				setPermissions(claims?.permissions ?? []);
			}
		})();
		identityRef.current = {
			userId,
			promise
		};
		return promise;
	}, []);
	(0, import_react.useEffect)(() => {
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
			if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") loadIdentity(nextSession);
		});
		return () => {
			active = false;
			subscription.subscription.unsubscribe();
		};
	}, [loadIdentity]);
	const refresh = (0, import_react.useCallback)(async () => {
		const { data } = await authClient.getSession();
		setSession(data.session);
		await loadIdentity(data.session, { force: true });
	}, [loadIdentity]);
	const value = (0, import_react.useMemo)(() => ({
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
		mustChangePassword: profile?.must_change_password === true || (session?.user.user_metadata)?.must_change_password === true,
		refresh
	}), [
		session,
		profile,
		roles,
		permissions,
		loading,
		refresh
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
	return context;
}
//#endregion
export { useAuth as n, AuthProvider as t };
