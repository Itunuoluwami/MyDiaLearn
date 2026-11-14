//#region node_modules/.nitro/vite/services/ssr/assets/portal-home-BO3OTxAy.js
/**
* Landing route for a signed-in account, based on their role(s).
* Portals that are not built yet fall back to the shared account page.
*/
var ROLE_HOME = {
	super_admin: "/admin/dashboard",
	admin: "/admin/dashboard",
	parent: "/dashboard",
	tutor: "/tutor/dashboard",
	student: "/student/dashboard",
	agency: "/agency/dashboard"
};
function portalHome(roles) {
	for (const role of roles) {
		const home = ROLE_HOME[role];
		if (home) return home;
	}
	return "/account";
}
//#endregion
export { portalHome as t };
