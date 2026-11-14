import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Ht as CircleCheck, Lt as Clock3, Qt as CalendarDays, T as ShieldCheck, _t as GraduationCap, a as Users, ln as BadgeCheck, mt as Inbox, n as Wallet, tn as CalendarCheck2 } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useTutorSummary, d as useRespondToBooking, h as useTutorRecord, l as useMyTutorSubjects, o as useAvailabilityWindows, p as useTutorBookings, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { m as useEarningsSummary } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
import { t as TutorBookingCard } from "./TutorBookingCard-DRobNGBc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.dashboard-Bz30DpNr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function greeting() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}
function TutorDashboardPage() {
	const { profile } = useAuth();
	const timezone = useTutorTimezone();
	const tutor = useTutorRecord();
	const summary = useTutorSummary();
	const bookings = useTutorBookings();
	const respond = useRespondToBooking();
	const earnings = useEarningsSummary();
	const mySubjects = useMyTutorSubjects();
	const windows = useAvailabilityWindows();
	const s = summary.data;
	const firstName = (profile?.full_name ?? "").split(" ")[0];
	const requests = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((row) => row.status === "pending" && new Date(row.ends_at) > /* @__PURE__ */ new Date()), [bookings.data]);
	const upcoming = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((row) => new Date(row.ends_at) > /* @__PURE__ */ new Date() && ["confirmed", "in_progress"].includes(row.status)), [bookings.data]);
	async function handleRespond(bookingId, accept) {
		try {
			await respond.mutateAsync({
				bookingId,
				accept
			});
			toast.success(accept ? "Lesson confirmed" : "Request declined");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Something went wrong";
			toast.error(message.includes("BOOKING_OVERLAP") ? "That slot clashes with another confirmed class." : message.includes("BOOKING_NOT_PENDING") ? "This request was already handled." : "We couldn't update that request.");
		}
	}
	const hasSubjects = (mySubjects.data ?? []).length > 0;
	const hasAvailability = (windows.data ?? []).some((w) => w.is_active);
	const teachingSetUp = hasSubjects && hasAvailability;
	const readiness = (0, import_react.useMemo)(() => {
		const t = tutor.data;
		if (!t) return 0;
		const checks = [
			Boolean(t.headline),
			Boolean(t.biography && t.biography.trim().length > 40),
			t.hourly_rate !== null,
			teachingSetUp,
			t.verification_status === "verified"
		];
		return Math.round(checks.filter(Boolean).length / checks.length * 100);
	}, [tutor.data, teachingSetUp]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "Dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-6xl space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft md:p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 max-w-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70",
									children: "Educator workspace"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "display-section mt-2 text-2xl text-primary-foreground md:text-3xl",
									children: [greeting(), firstName ? `, ${firstName}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-primary-foreground/85 md:text-base",
									children: Number(s?.classes_today ?? 0) > 0 ? `You have ${s?.classes_today} ${Number(s?.classes_today) === 1 ? "class" : "classes"} today · ${timezone}` : `No classes scheduled today · times shown in ${timezone}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "cta",
										className: "min-h-11",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/tutor/classes",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }), " Open my classes"]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										variant: "ghost",
										className: "min-h-11 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/tutor/availability",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" }), " Set availability"]
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-secondary/25 blur-2xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-accent/20 blur-2xl"
						})
					]
				}),
				summary.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 4 }) : summary.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load your teaching summary right now.",
					onRetry: () => void summary.refetch()
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							variant: "primary",
							label: "Classes today",
							value: Number(s?.classes_today ?? 0),
							hint: upcoming[0] ? `Next: ${upcoming[0].subject_name ?? "lesson"}` : "Nothing scheduled",
							icon: CalendarCheck2
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Lesson requests",
							value: requests.length,
							hint: requests.length > 0 ? "Waiting on you" : "All caught up",
							icon: Inbox
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Active students",
							value: Number(s?.active_students ?? 0),
							icon: Users
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Lessons taught",
							value: Number(s?.completed_lessons ?? 0),
							icon: CircleCheck
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Earnings snapshot",
					description: "Balances after DiaLearn's commission and payment fees.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutor/earnings",
							children: "Open earnings"
						})
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-primary-soft/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Available"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xl font-semibold tabular-nums text-primary-deep",
									children: formatMoney(Number(earnings.data?.available_balance ?? 0), earnings.data?.currency ?? s?.currency ?? "USD")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-surface/70 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Pending"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xl font-semibold tabular-nums",
									children: formatMoney(Number(earnings.data?.pending_earnings ?? 0), earnings.data?.currency ?? s?.currency ?? "USD")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-surface/70 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Net earned"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xl font-semibold tabular-nums",
									children: formatMoney(Number(earnings.data?.net_earnings ?? 0), earnings.data?.currency ?? s?.currency ?? "USD")
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center gap-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
							className: "size-3.5 text-primary",
							"aria-hidden": "true"
						}), earnings.data?.schedule_label ?? "Payouts follow the platform payout policy."]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Teaching readiness",
					description: "Everything families look for before they book you.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutor/profile",
							children: "Open profile"
						})
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: readiness,
							className: "h-2 min-w-40 flex-1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-semibold tabular-nums",
							children: [readiness, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 grid gap-2 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: Boolean(tutor.data?.headline),
								label: "Profile headline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: Boolean(tutor.data?.biography && tutor.data.biography.trim().length > 40),
								label: "Biography families can trust"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: tutor.data?.hourly_rate !== null,
								label: "Hourly rate set"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: teachingSetUp,
								label: "Subjects and availability added",
								href: "/tutor/availability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: tutor.data?.verification_status === "verified",
								label: "Verified by the DiaLearn team",
								href: "/tutor/verification"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyItem, {
								done: Boolean(tutor.data?.is_listed),
								label: "Listed in tutor search",
								href: "/tutor/profile"
							})
						]
					})]
				}),
				requests.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
					title: "Lesson requests",
					description: "Families waiting for you to confirm. Accepting checks your calendar for clashes.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: requests.slice(0, 4).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorBookingCard, {
							booking,
							timezone,
							onAccept: () => void handleRespond(booking.id, true),
							onDecline: () => void handleRespond(booking.id, false),
							busy: respond.isPending
						}, booking.id))
					}), requests.length > 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/tutor/classes",
							children: [
								"See all ",
								requests.length,
								" requests"
							]
						})
					}) : null]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Upcoming classes",
					description: `Times shown in your timezone · ${timezone}`,
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutor/classes",
							children: "Open calendar"
						})
					}),
					children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
						rows: 2,
						height: "h-32"
					}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load your classes right now.",
						onRetry: () => void bookings.refetch()
					}) : upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
						icon: GraduationCap,
						title: "No classes scheduled yet",
						body: tutor.data?.verification_status === "verified" ? "Add availability so families can book you — confirmed lessons will appear here." : "Once you're verified and listed, confirmed lessons will appear here.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "cta",
							className: "min-h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: tutor.data?.verification_status === "verified" ? "/tutor/availability" : "/tutor/verification",
								children: tutor.data?.verification_status === "verified" ? "Set availability" : "Continue verification"
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: upcoming.slice(0, 4).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorBookingCard, {
							booking,
							timezone
						}, booking.id))
					})
				})
			]
		})
	});
}
function ReadyItem({ done, label, href }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: done ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-success" : "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
		children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "min-w-0 text-sm",
		children: label
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: href && !done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		className: "focus-ring flex min-h-11 items-center gap-2.5 rounded-lg px-1 transition-colors hover:bg-surface",
		children: content
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex min-h-11 items-center gap-2.5 px-1",
		children: content
	}) });
}
//#endregion
export { TutorDashboardPage as component };
