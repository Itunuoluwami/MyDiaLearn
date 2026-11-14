import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { D as Settings, Mt as CreditCard, Ot as Ellipsis, Qt as CalendarDays, T as ShieldCheck, Xt as ChartColumn, Y as MessagesSquare, Yt as ChartLine, a as Users, an as Bell, c as UserRound, k as Search, lt as LayoutDashboard, nt as LogOut } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CrATILuI.mjs";
import { x as useNotifications } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ParentShell-C4Q6P4BE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Documented Parent Portal information architecture. Labels are static UI copy. */
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/children",
		label: "My Children",
		icon: Users
	},
	{
		to: "/find-tutor",
		label: "Find Tutor",
		icon: Search
	},
	{
		to: "/my-tutors",
		label: "Tutors",
		icon: UserRound
	},
	{
		to: "/bookings",
		label: "Bookings",
		icon: CalendarDays
	},
	{
		to: "/payments",
		label: "Payments",
		icon: CreditCard
	},
	{
		to: "/progress",
		label: "Learning Progress",
		icon: ChartLine
	},
	{
		to: "/messages",
		label: "Messages",
		icon: MessagesSquare
	},
	{
		to: "/reports",
		label: "Reports",
		icon: ChartColumn
	},
	{
		to: "/notifications",
		label: "Notifications",
		icon: Bell
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
var MOBILE_PRIMARY = [
	"/dashboard",
	"/children",
	"/find-tutor",
	"/bookings"
];
function useActivePath() {
	return useRouterState({ select: (state) => state.location.pathname });
}
function isActive(pathname, to) {
	return pathname === to || pathname.startsWith(`${to}/`);
}
function NavList({ onNavigate }) {
	const pathname = useActivePath();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Parent portal sections",
		className: "flex flex-col gap-0.5",
		children: NAV.map((item) => {
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
		})
	});
}
function ParentShell({ title, description, actions, children }) {
	const { profile } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useActivePath();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const { data: notifications } = useNotifications();
	const unread = (notifications ?? []).filter((item) => !item.read_at).length;
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
	const firstName = (profile?.full_name ?? "").split(" ")[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-site flex min-h-16 items-center justify-between gap-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
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
										children: "Parent portal navigation"
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "focus-ring flex items-center gap-2 rounded-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: BRAND.logoUrl,
								alt: BRAND.name,
								className: "h-11 w-auto md:h-12"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 sm:gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "icon",
							className: "relative",
							"aria-label": unread > 0 ? `Notifications, ${unread} unread` : "Notifications",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/notifications",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									className: "size-5",
									"aria-hidden": "true"
								}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 size-2 rounded-full bg-secondary ring-2 ring-card" }) : null]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
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
									children: firstName || "Account"
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
										to: "/settings",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Settings"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/children",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Children & permissions"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									onSelect: () => void handleSignOut(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
								})
							]
						})] })]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-site flex gap-8 pb-28 pt-6 lg:pb-12 lg:pt-8",
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Primary",
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/98 backdrop-blur lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-lg grid-cols-5",
					children: [NAV.filter((item) => MOBILE_PRIMARY.includes(item.to)).map((item) => {
						const Icon = item.icon;
						const active = isActive(pathname, item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							"aria-current": active ? "page" : void 0,
							className: cn("focus-ring flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.label
							})]
						}, item.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						open: moreOpen,
						onOpenChange: setMoreOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[0.65rem] font-medium text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
									className: "size-5",
									"aria-hidden": "true"
								}), "More"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "bottom",
							className: "rounded-t-2xl p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "text-base",
								children: "All sections"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNavigate: () => setMoreOpen(false) })
							})]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { ParentShell as t };
