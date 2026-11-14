import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { $t as CalendarClock, D as Settings, Mt as CreditCard, Ot as Ellipsis, St as Flag, T as ShieldCheck, Xt as ChartColumn, a as Users, d as UserCog, ft as KeyRound, j as ScrollText, lt as LayoutDashboard, n as Wallet, nt as LogOut, rn as Building2, vt as Gavel, x as SquareCheckBig } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as clearAdminContextCache } from "./admin-guard-DXXXDJr3.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CrATILuI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminShell-B9F1FU0d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Admin Portal information architecture. The governance group at the end is
* permission-filtered, so a scoped admin never sees a link they cannot open. */
var NAV = [
	{
		to: "/admin/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/admin/users",
		label: "Users",
		icon: Users
	},
	{
		to: "/admin/verification",
		label: "Tutor verification",
		icon: ShieldCheck
	},
	{
		to: "/admin/agencies",
		label: "Agencies",
		icon: Building2,
		permission: "admin.verification"
	},
	{
		to: "/admin/bookings",
		label: "Bookings",
		icon: CalendarClock
	},
	{
		to: "/admin/payments",
		label: "Payments",
		icon: CreditCard
	},
	{
		to: "/admin/payouts",
		label: "Payouts",
		icon: Wallet
	},
	{
		to: "/admin/disputes",
		label: "Disputes",
		icon: Gavel
	},
	{
		to: "/admin/moderation",
		label: "Moderation",
		icon: Flag
	},
	{
		to: "/admin/reports",
		label: "Reports",
		icon: ChartColumn
	},
	{
		to: "/admin/settings",
		label: "Platform settings",
		icon: Settings
	}
];
var GOVERNANCE_NAV = [
	{
		to: "/admin/approvals",
		label: "Approvals",
		icon: SquareCheckBig,
		permission: "admin.approvals"
	},
	{
		to: "/admin/audit",
		label: "Audit log",
		icon: ScrollText,
		permission: "admin.audit"
	},
	{
		to: "/admin/admins",
		label: "Admins & roles",
		icon: UserCog,
		superAdminOnly: true
	}
];
function useActivePath() {
	return useRouterState({ select: (state) => state.location.pathname });
}
function isActive(pathname, to) {
	return pathname === to || pathname.startsWith(`${to}/`);
}
function NavLink({ item, onNavigate }) {
	const pathname = useActivePath();
	const Icon = item.icon;
	const active = isActive(pathname, item.to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		onClick: onNavigate,
		"aria-current": active ? "page" : void 0,
		className: cn("focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200", active ? "bg-primary-soft text-primary-deep shadow-soft" : "text-muted-foreground hover:bg-surface hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: item.label
		})]
	});
}
function NavList({ onNavigate }) {
	const pathname = useActivePath();
	const { hasPermission, isSuperAdmin } = useAuth();
	const governance = GOVERNANCE_NAV.filter((item) => {
		if (item.superAdminOnly) return isSuperAdmin;
		return !item.permission || hasPermission(item.permission);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Admin portal sections",
		className: "flex flex-col gap-0.5",
		children: [NAV.map((item) => {
			const Icon = item.icon;
			const active = isActive(pathname, item.to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: onNavigate,
				"aria-current": active ? "page" : void 0,
				className: cn("focus-ring flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all duration-200", active ? "bg-primary-soft text-primary-deep shadow-soft" : "text-muted-foreground hover:bg-surface hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-4 shrink-0",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: item.label
				})]
			}, item.to);
		}), governance.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow mt-5 px-3 pb-1",
			children: "Governance"
		}), governance.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
			item,
			onNavigate
		}, item.to))] }) : null]
	});
}
/**
* Admin Portal shell. This portal is desk-work by nature, so — unlike
* TutorShell/StudentShell/ParentShell — it skips the fixed bottom mobile tab
* bar and instead relies on the same Sheet slide-over nav on every
* breakpoint below `lg`. It still has to not break on a phone, so the
* slide-over remains fully usable there; it just isn't optimized as the
* primary layout the way the family portals are.
*/
function AdminShell({ title, description, actions, children }) {
	const { profile, isSuperAdmin } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const firstName = (profile?.full_name ?? "").split(" ")[0];
	async function handleSignOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		clearAdminContextCache();
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
					className: "flex min-w-0 items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
							open: menuOpen,
							onOpenChange: setMenuOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
								asChild: true,
								className: "lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Open navigation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
								side: "left",
								className: "w-[18rem] p-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
										className: "sr-only",
										children: "Admin portal navigation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-b border-border p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: BRAND.logoUrl,
											alt: BRAND.name,
											className: "h-11 w-auto"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNavigate: () => setMenuOpen(false) })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin/dashboard",
							className: "focus-ring flex items-center gap-2 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: BRAND.logoUrl,
								alt: BRAND.name,
								className: "h-11 w-auto md:h-12"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-deep md:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "size-3.5",
								"aria-hidden": "true"
							}), isSuperAdmin ? "Super admin" : "Admin"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1 sm:gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "min-h-11 gap-2 px-2",
							"aria-label": "Account menu",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep",
								children: (profile?.full_name ?? "?").charAt(0).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden max-w-32 truncate text-sm font-medium sm:inline",
								children: firstName || "Admin"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
								className: "space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: profile?.full_name ?? "Account"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-normal text-muted-foreground",
									children: profile?.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin/security",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), " Password & security"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin/settings",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Platform settings"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => void handleSignOut(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
							})
						]
					})] })
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-site flex gap-8 pb-12 pt-6 lg:pt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden w-60 shrink-0 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sticky top-24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, {})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display-section text-2xl md:text-3xl",
							children: title
						}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lead mt-1.5 text-sm md:text-base",
							children: description
						}) : null]
					}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex shrink-0 flex-wrap gap-2",
						children: actions
					}) : null]
				}), children]
			})]
		})]
	});
}
//#endregion
export { AdminShell as t };
