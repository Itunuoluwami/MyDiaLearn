import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button, t as BRAND } from "./button-Be6IoNc1.mjs";
import { i as authClient } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { D as Settings, Ot as Ellipsis, Qt as CalendarDays, T as ShieldCheck, a as Users, ln as BadgeCheck, lt as LayoutDashboard, n as Wallet, nt as LogOut, rn as Building2 } from "../_libs/lucide-react.mjs";
import { a as SheetTitle, n as SheetContent, o as SheetTrigger, t as Sheet } from "./sheet-Cis54Nrd.mjs";
import { _ as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as apiPost, i as apiPatch, n as apiDelete, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CrATILuI.mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AgencyShell-DfnQMswl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAgency() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["agency", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/agencies/me");
		}
	});
}
function useAgencyDashboard() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["agency-dashboard", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/agencies/me/dashboard");
		}
	});
}
function useUpdateAgency() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (patch) => {
			return apiPatch("/agencies/me", patch);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agency"] });
			queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
		}
	});
}
function useSubmitAgencyVerification() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return apiPost("/agencies/me/verification/submit", {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agency"] });
			queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
		}
	});
}
function useAgencyTutors() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["agency-tutors", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/agencies/me/tutors");
		}
	});
}
function useAddAgencyTutor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return apiPost("/agencies/me/tutors", input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
			queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
		}
	});
}
function useRemoveAgencyTutor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (tutorId) => {
			await apiDelete(`/agencies/me/tutors/${tutorId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
			queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
		}
	});
}
var tutorBase = (tutorId) => `/agencies/me/tutors/${tutorId}`;
function useManagedInvalidate(tutorId) {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ["agency-tutor", tutorId] });
		queryClient.invalidateQueries({ queryKey: ["agency-tutors"] });
	};
}
function useManagedTutorProfile(tutorId) {
	return useQuery({
		queryKey: [
			"agency-tutor",
			tutorId,
			"profile"
		],
		queryFn: async () => {
			return apiGet(`${tutorBase(tutorId)}/profile`);
		}
	});
}
function useUpdateManagedTutorProfile(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (patch) => {
			return apiPatch(`${tutorBase(tutorId)}/profile`, patch);
		},
		onSuccess: invalidate
	});
}
function useManagedTutorSubjects(tutorId) {
	return useQuery({
		queryKey: [
			"agency-tutor",
			tutorId,
			"subjects"
		],
		queryFn: async () => {
			return apiGet(`${tutorBase(tutorId)}/subjects`);
		}
	});
}
function useAddManagedTutorSubject(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (input) => {
			await apiPost(`${tutorBase(tutorId)}/subjects`, {
				subjectId: input.subjectId,
				...input.educationLevelId ? { educationLevelId: input.educationLevelId } : {}
			});
		},
		onSuccess: invalidate
	});
}
function useRemoveManagedTutorSubject(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (id) => {
			await apiDelete(`${tutorBase(tutorId)}/subjects/${id}`);
		},
		onSuccess: invalidate
	});
}
function useManagedTutorAvailability(tutorId) {
	return useQuery({
		queryKey: [
			"agency-tutor",
			tutorId,
			"availability"
		],
		queryFn: async () => {
			return apiGet(`${tutorBase(tutorId)}/availability`);
		}
	});
}
function useAddManagedTutorWindow(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (input) => {
			await apiPost(`${tutorBase(tutorId)}/availability`, input);
		},
		onSuccess: invalidate
	});
}
function useSetManagedTutorWindow(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (input) => {
			await apiPatch(`${tutorBase(tutorId)}/availability/${input.id}`, { isActive: input.isActive });
		},
		onSuccess: invalidate
	});
}
function useDeleteManagedTutorWindow(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (id) => {
			await apiDelete(`${tutorBase(tutorId)}/availability/${id}`);
		},
		onSuccess: invalidate
	});
}
function useManagedTutorVerification(tutorId) {
	return useQuery({
		queryKey: [
			"agency-tutor",
			tutorId,
			"verification"
		],
		queryFn: async () => {
			return apiGet(`${tutorBase(tutorId)}/verification`);
		}
	});
}
function useSubmitManagedTutorVerification(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async () => {
			return apiPost(`${tutorBase(tutorId)}/verification/submit`, {});
		},
		onSuccess: invalidate
	});
}
function useManagedTutorDocuments(tutorId) {
	return useQuery({
		queryKey: [
			"agency-tutor",
			tutorId,
			"documents"
		],
		queryFn: async () => {
			return apiGet(`${tutorBase(tutorId)}/documents`);
		}
	});
}
function useUploadManagedTutorDocument(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (input) => {
			const form = new FormData();
			form.append("file", input.file);
			const uploaded = await apiPost(`${tutorBase(tutorId)}/documents/upload`, form);
			await apiPost(`${tutorBase(tutorId)}/documents`, {
				label: input.label,
				storagePath: uploaded.storagePath,
				sizeBytes: uploaded.sizeBytes,
				...input.stepId ? { stepId: input.stepId } : {},
				...uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}
			});
		},
		onSuccess: invalidate
	});
}
function useDeleteManagedTutorDocument(tutorId) {
	const invalidate = useManagedInvalidate(tutorId);
	return useMutation({
		mutationFn: async (documentId) => {
			await apiDelete(`${tutorBase(tutorId)}/documents/${documentId}`);
		},
		onSuccess: invalidate
	});
}
function useAgencyBookings(params) {
	const { user } = useAuth();
	return useQuery({
		queryKey: [
			"agency-bookings",
			user?.id,
			params.status
		],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet(`/agencies/me/bookings?status=${params.status}`);
		}
	});
}
function useAgencyEarnings() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["agency-earnings", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/agencies/me/earnings");
		}
	});
}
function useAgencyPayouts() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["agency-payouts", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/agencies/me/payouts");
		}
	});
}
function useRequestAgencyPayout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (amount) => {
			return apiPost("/agencies/me/payouts", { amount });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agency-payouts"] });
			queryClient.invalidateQueries({ queryKey: ["agency-earnings"] });
			queryClient.invalidateQueries({ queryKey: ["agency-dashboard"] });
		}
	});
}
/** Agency portal information architecture. Labels are UI copy only. */
var NAV = [
	{
		to: "/agency/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/agency/tutors",
		label: "Tutors",
		icon: Users
	},
	{
		to: "/agency/bookings",
		label: "Bookings",
		icon: CalendarDays
	},
	{
		to: "/agency/earnings",
		label: "Earnings",
		icon: Wallet
	},
	{
		to: "/agency/profile",
		label: "Agency profile",
		icon: Building2
	},
	{
		to: "/account",
		label: "Account settings",
		icon: Settings
	}
];
var MOBILE_PRIMARY = [
	"/agency/dashboard",
	"/agency/tutors",
	"/agency/bookings",
	"/agency/earnings"
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
		"aria-label": "Agency portal sections",
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
/** Until DiaLearn verifies the agency, none of its tutors can appear in search. */
function VerificationBanner() {
	const { data: agency } = useAgency();
	const pathname = useActivePath();
	if (!agency) return null;
	if (agency.verificationStatus === "verified") return null;
	if (isActive(pathname, "/agency/profile")) return null;
	const waiting = agency.verificationStatus === "pending" || agency.verificationStatus === "in_review";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex flex-col gap-3 rounded-2xl border border-secondary/40 bg-secondary-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary-deep shadow-soft",
				children: waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: waiting ? "Your agency is with our team for review" : "Your tutors are not visible to families yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: waiting ? "We check every agency before its tutors appear in search. You can keep adding and preparing tutors meanwhile." : "Complete your agency details and submit them for verification. Tutors under your agency are listed only once your agency is verified."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			size: "sm",
			className: "min-h-11 shrink-0 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/agency/profile",
				children: waiting ? "View status" : "Complete verification"
			})
		})]
	});
}
function AgencyShell({ title, description, actions, children }) {
	const { profile } = useAuth();
	const { data: agency } = useAgency();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useActivePath();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
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
											children: "Agency portal navigation"
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
								to: "/agency/dashboard",
								className: "focus-ring flex items-center gap-2 rounded-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: BRAND.logoUrl,
									alt: BRAND.name,
									className: "h-11 w-auto md:h-12"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-deep md:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
									className: "size-3.5",
									"aria-hidden": "true"
								}), " Agency"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 sm:gap-2",
						children: [agency ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex", VERIFICATION_TONE[agency.verificationStatus]),
							children: VERIFICATION_LABEL[agency.verificationStatus]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
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
										to: "/agency/profile",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4" }),
											" ",
											agency?.name ?? "Agency profile"
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/account",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Account settings"]
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
export { useSubmitManagedTutorVerification as C, useUploadManagedTutorDocument as E, useSubmitAgencyVerification as S, useUpdateManagedTutorProfile as T, useManagedTutorVerification as _, useAgency as a, useRequestAgencyPayout as b, useAgencyEarnings as c, useDeleteManagedTutorDocument as d, useDeleteManagedTutorWindow as f, useManagedTutorSubjects as g, useManagedTutorProfile as h, useAddManagedTutorWindow as i, useAgencyPayouts as l, useManagedTutorDocuments as m, useAddAgencyTutor as n, useAgencyBookings as o, useManagedTutorAvailability as p, useAddManagedTutorSubject as r, useAgencyDashboard as s, AgencyShell as t, useAgencyTutors as u, useRemoveAgencyTutor as v, useUpdateAgency as w, useSetManagedTutorWindow as x, useRemoveManagedTutorSubject as y };
