import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { t as portalHome } from "./portal-home-BO3OTxAy.mjs";
import { D as Settings, Q as Menu, a as Users, lt as LayoutDashboard, nt as LogOut, o as User } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PortalShell-BYbUJZ2R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Generic account pages are only for accounts without a dedicated portal.
* Anyone whose role maps to a portal (e.g. parents) is sent there instead.
*/
function useRedirectToPortalHome() {
	const { roles, loading } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		const home = portalHome(roles);
		if (home !== "/account") navigate({
			to: home,
			replace: true
		});
	}, [
		loading,
		roles,
		navigate
	]);
}
/**
* Navigation is permission-driven: entries appear when the signed-in user's
* roles map to the permission key in role_permissions. No hardcoded role checks.
*/
var NAV_ITEMS = [
	{
		to: "/account",
		label: "My account",
		icon: User
	},
	{
		to: "/family",
		label: "Family & students",
		icon: Users,
		permission: "students.manage"
	},
	{
		to: "/admin/settings",
		label: "Platform settings",
		icon: Settings,
		permission: "admin.settings"
	}
];
function NavLinks({ onNavigate }) {
	const { hasPermission, roles } = useAuth();
	const home = portalHome(roles);
	const items = home === "/account" ? NAV_ITEMS : [{
		to: home,
		label: "My portal",
		icon: LayoutDashboard
	}, ...NAV_ITEMS.filter((item) => item.to !== "/account" && item.to !== "/family")];
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1",
		children: items.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => {
			const Icon = item.icon;
			const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				className: cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-primary-soft text-primary-deep" : "text-muted-foreground hover:bg-surface hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
			}, item.to);
		})
	});
}
function PortalShell({ title, description, children }) {
	const { profile, roles } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	async function handleSignOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await authClient.signOut();
		toast.success("Signed out");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site flex min-h-16 items-center justify-between gap-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						open: menuOpen,
						onOpenChange: setMenuOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							className: "md:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "left",
							className: "w-[17rem] p-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
									className: "sr-only",
									children: "Menu"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-b border-border p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: BRAND.logoUrl,
										alt: "DiaLearn",
										className: "h-11 w-auto"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { onNavigate: () => setMenuOpen(false) })
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: BRAND.logoUrl,
							alt: "DiaLearn",
							className: "h-11 w-auto md:h-12"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden text-right sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold leading-tight",
							children: profile?.full_name ?? "Account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: profile?.email
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleSignOut,
						className: "min-h-11 sm:min-h-9",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Sign out"
						})]
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site flex gap-8 py-6 md:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden w-60 shrink-0 md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display-section text-3xl",
							children: title
						}), roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "capitalize",
							children: role
						}, role))]
					}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "lead mt-2 text-base",
						children: description
					}) : null]
				}), children]
			})]
		})]
	});
}
//#endregion
export { useRedirectToPortalHome as n, PortalShell as t };
