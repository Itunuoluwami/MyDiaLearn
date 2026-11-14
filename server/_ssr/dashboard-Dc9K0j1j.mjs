import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { F as Receipt, Ht as CircleCheck, It as Clock, Qt as CalendarDays, R as Plus, Zt as CalendarPlus, _t as GraduationCap, a as Users, k as Search } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as useTutorCards, O as useViewerTimezone, S as useParentSummary, _ as useChildren, h as useBookings, i as childName } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ChildSwitcher } from "./ChildSwitcher-D_zmULnc.mjs";
import { t as ClassCard } from "./ClassCard-Dq9EP8Zw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Dc9K0j1j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function greeting() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}
function DashboardPage() {
	const { profile } = useAuth();
	const timezone = useViewerTimezone();
	const [selectedChild, setSelectedChild] = (0, import_react.useState)(null);
	const children = useChildren();
	const summary = useParentSummary();
	const bookings = useBookings(selectedChild ? { studentId: selectedChild } : void 0);
	const tutorIds = (0, import_react.useMemo)(() => (bookings.data ?? []).map((row) => row.tutor_id), [bookings.data]);
	const tutors = useTutorCards(tutorIds);
	const kids = children.data ?? [];
	const childById = (0, import_react.useMemo)(() => new Map(kids.map((child) => [child.id, child])), [kids]);
	const upcoming = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((row) => new Date(row.ends_at).getTime() > Date.now() && [
		"pending",
		"confirmed",
		"in_progress"
	].includes(row.status)).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()), [bookings.data]);
	const approvals = (0, import_react.useMemo)(() => (bookings.data ?? []).filter((row) => row.status === "pending"), [bookings.data]);
	const s = summary.data;
	const firstName = (profile?.full_name ?? "").split(" ")[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Dashboard",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-6xl space-y-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft md:p-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative z-10 max-w-xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "display-section text-2xl text-primary-foreground md:text-3xl",
										children: [greeting(), firstName ? `, ${firstName}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-primary-foreground/85 md:text-base",
										children: kids.length === 0 ? "Start by adding a learner — then we can help you find the right tutor." : `Here's what's happening across ${kids.length} ${kids.length === 1 ? "learner" : "learners"} today.`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "cta",
											className: "min-h-11",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/find-tutor",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Find a tutor"]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "ghost",
											className: "min-h-11 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/children",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add child"]
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
						message: "We couldn't load your family summary right now.",
						onRetry: () => void summary.refetch()
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								variant: "primary",
								label: "Upcoming classes",
								value: Number(s?.upcoming_classes ?? 0),
								hint: upcoming[0] ? `Next: ${upcoming[0].subjects?.name ?? "lesson"}` : "Nothing scheduled",
								icon: CalendarDays
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Active students",
								value: Number(s?.active_students ?? 0),
								hint: "On your account",
								icon: Users
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Active tutors",
								value: Number(s?.active_tutors ?? 0),
								icon: GraduationCap
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Completed lessons",
								value: Number(s?.completed_lessons ?? 0),
								icon: CircleCheck
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: "My children",
						description: "Switch a child to focus every section below on them.",
						action: kids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/children",
								children: "Manage"
							})
						}) : null,
						children: children.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 1,
							height: "h-14"
						}) : children.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load your children right now.",
							onRetry: () => void children.refetch()
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildSwitcher, {
							children: kids,
							selectedId: selectedChild,
							onSelect: setSelectedChild
						})
					}),
					approvals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
						title: "Needs your approval",
						description: "Requests waiting on you before a lesson is confirmed.",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: approvals.slice(0, 3).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassCard, {
								booking,
								child: childById.get(booking.student_id),
								tutor: tutors.map.get(booking.tutor_id),
								viewerTimezone: timezone
							}, booking.id))
						}), approvals.length > 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/bookings",
								children: [
									"See all ",
									approvals.length,
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
								to: "/bookings",
								children: "Open calendar"
							})
						}),
						children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
							rows: 2,
							height: "h-36"
						}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
							message: "We couldn't load your classes right now.",
							onRetry: () => void bookings.refetch()
						}) : upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
							icon: CalendarPlus,
							title: "No upcoming classes",
							body: "Your scheduled lessons will appear here as soon as a booking is confirmed.",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								className: "min-h-11",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/find-tutor",
									children: "Find a tutor"
								})
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							children: upcoming.slice(0, 3).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassCard, {
								booking,
								child: childById.get(booking.student_id),
								tutor: tutors.map.get(booking.tutor_id),
								viewerTimezone: timezone
							}, booking.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
						title: "Quick actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								kids.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
									to: "/children",
									icon: Plus,
									label: "Add child",
									hint: "Start a learner profile"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
									to: "/find-tutor",
									icon: Search,
									label: "Find a tutor",
									hint: "Search the marketplace"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
									to: "/bookings",
									icon: CalendarDays,
									label: "View calendar",
									hint: "All classes"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
									to: "/payments",
									icon: Receipt,
									label: "View payments",
									hint: "History & receipts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
									to: "/progress",
									icon: Clock,
									label: "Learning progress",
									hint: "Per child"
								})
							]
						}), kids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-xs text-muted-foreground",
							children: [
								"Booking for",
								" ",
								kids.slice(0, 3).map((child) => childName(child)).join(", "),
								kids.length > 3 ? ` +${kids.length - 3} more` : ""
							]
						}) : null]
					})
				]
			})
		})
	});
}
function QuickAction({ to, icon: Icon, label, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "focus-ring group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:shadow-lift",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-deep transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-semibold",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted-foreground",
				children: hint
			})]
		})]
	});
}
//#endregion
export { DashboardPage as component };
