import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { D as Settings, Lt as Clock3, Ot as Ellipsis, Qt as CalendarDays, Rt as ClipboardList, T as ShieldCheck, Xt as ChartColumn, Y as MessagesSquare, _t as GraduationCap, a as Users, an as Bell, bt as FolderOpen, c as UserRound, ln as BadgeCheck, lt as LayoutDashboard, n as Wallet, nt as LogOut, y as Star } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CrATILuI.mjs";
import { h as useTutorRecord, n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { x as useNotifications } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TutorShell-Cw8Ozq-q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Tutor Portal information architecture for this batch. Labels are UI copy only. */
var NAV = [
	{
		to: "/tutor/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/tutor/classes",
		label: "Classes",
		icon: CalendarDays
	},
	{
		to: "/tutor/availability",
		label: "Availability",
		icon: Clock3
	},
	{
		to: "/tutor/students",
		label: "Students",
		icon: Users
	},
	{
		to: "/tutor/assignments",
		label: "Assignments",
		icon: ClipboardList
	},
	{
		to: "/tutor/resources",
		label: "Materials",
		icon: FolderOpen
	},
	{
		to: "/tutor/messages",
		label: "Messages",
		icon: MessagesSquare
	},
	{
		to: "/tutor/earnings",
		label: "Earnings",
		icon: Wallet
	},
	{
		to: "/tutor/reviews",
		label: "Reviews",
		icon: Star
	},
	{
		to: "/tutor/analytics",
		label: "Analytics",
		icon: ChartColumn
	},
	{
		to: "/tutor/profile",
		label: "Teaching profile",
		icon: UserRound
	},
	{
		to: "/tutor/verification",
		label: "Verification",
		icon: ShieldCheck
	},
	{
		to: "/tutor/notifications",
		label: "Notifications",
		icon: Bell
	},
	{
		to: "/tutor/settings",
		label: "Settings",
		icon: Settings
	}
];
var MOBILE_PRIMARY = [
	"/tutor/dashboard",
	"/tutor/classes",
	"/tutor/students",
	"/tutor/earnings"
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
		"aria-label": "Tutor portal sections",
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
/** Persistent, honest status banner: an unverified tutor is never publicly bookable. */
function VerificationBanner() {
	const { data: tutor } = useTutorRecord();
	const pathname = useActivePath();
	if (!tutor) return null;
	if (tutor.verification_status === "verified" && tutor.is_listed) return null;
	if (isActive(pathname, "/tutor/verification")) return null;
	const copy = {
		verified: {
			title: "You're verified — switch your profile on to start receiving bookings",
			body: "Publishing is your choice. Turn listing on from your teaching profile whenever you're ready.",
			cta: "Open profile",
			to: "/tutor/profile"
		},
		unverified: {
			title: "Your profile is not visible to families yet",
			body: "Complete your teaching profile and submit your documents. Our team verifies every tutor before they appear in search.",
			cta: "Continue verification",
			to: "/tutor/verification"
		},
		pending: {
			title: "Your documents are with our review team",
			body: "Nothing more to do for now. We'll let you know as soon as there's a decision, and your profile goes live once you're approved.",
			cta: "View verification",
			to: "/tutor/verification"
		},
		in_review: {
			title: "Our team is reviewing your profile",
			body: "A reviewer is going through your documents now. We'll be in touch if anything else is needed.",
			cta: "View verification",
			to: "/tutor/verification"
		},
		rejected: {
			title: "Your verification needs changes before we can approve it",
			body: "A reviewer has left notes on what to fix. Update the documents they flagged and submit again.",
			cta: "See what to fix",
			to: "/tutor/verification"
		},
		suspended: {
			title: "Your profile is suspended",
			body: "You cannot take new bookings while a profile is suspended. Contact the DiaLearn team if you think this is a mistake.",
			cta: "View verification",
			to: "/tutor/verification"
		}
	};
	const status = tutor.verification_status;
	const state = copy[status] ?? copy.unverified;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex flex-col gap-3 rounded-2xl border border-secondary/40 bg-secondary-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary-deep shadow-soft",
				children: status === "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: state.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: state.body
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			size: "sm",
			className: "min-h-11 shrink-0 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: state.to,
				children: state.cta
			})
		})]
	});
}
function TutorShell({ title, description, actions, children }) {
	const { profile } = useAuth();
	const { data: tutor } = useTutorRecord();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useActivePath();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const { data: notifications } = useNotifications();
	const unread = (notifications ?? []).filter((item) => !item.read_at).length;
	const firstName = (profile?.full_name ?? "").split(" ")[0];
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
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
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
											children: "Tutor portal navigation"
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
								to: "/tutor/dashboard",
								className: "focus-ring flex items-center gap-2 rounded-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: BRAND.logoUrl,
									alt: BRAND.name,
									className: "h-11 w-auto md:h-12"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-deep md:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, {
									className: "size-3.5",
									"aria-hidden": "true"
								}), " Educator"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 sm:gap-2",
						children: [
							tutor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex", VERIFICATION_TONE[tutor.verification_status]),
								children: VERIFICATION_LABEL[tutor.verification_status]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "icon",
								className: "relative",
								"aria-label": unread > 0 ? `Notifications, ${unread} unread` : "Notifications",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tutor/notifications",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
										className: "size-5",
										"aria-hidden": "true"
									}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 size-2 rounded-full bg-secondary ring-2 ring-card" }) : null]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
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
											to: "/tutor/profile",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }), " Teaching profile"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/tutor/verification",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Verification"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/tutor/settings",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Settings"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => void handleSignOut(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
									})
								]
							})] })
						]
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
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerificationBanner, {}),
						children
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Primary",
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden",
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
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "More" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "bottom",
							className: "rounded-t-2xl p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "mb-3 text-base",
								children: "All sections"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNavigate: () => setMoreOpen(false) })]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { TutorShell as t };
