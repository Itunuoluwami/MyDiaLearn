import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { Ht as CircleCheck, Qt as CalendarDays, T as ShieldCheck, a as Users, l as UserPlus, ln as BadgeCheck, n as Wallet } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as VERIFICATION_TONE, t as VERIFICATION_LABEL } from "./tutor-data-BgedrW1M.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { s as useAgencyDashboard, t as AgencyShell, u as useAgencyTutors } from "./AgencyShell-DfnQMswl.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.dashboard-CHoL9Dno.js
var import_jsx_runtime = require_jsx_runtime();
function AgencyDashboardPage() {
	const dashboard = useAgencyDashboard();
	const tutors = useAgencyTutors();
	const data = dashboard.data;
	const counts = data?.counts;
	const earnings = data?.earnings;
	const roster = (tutors.data ?? []).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyShell, {
		title: data ? data.agency.name : "Agency dashboard",
		description: "Your tutors, their verification and your team's lessons and earnings.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "cta",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/agency/tutors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Add a tutor"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				dashboard.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 4 }) : dashboard.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: dashboard.error.message || "We couldn't load your dashboard.",
					onRetry: () => void dashboard.refetch()
				}) : counts ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Tutors",
							value: counts.tutors_total,
							hint: `${counts.tutors_listed} visible to families`,
							icon: Users,
							variant: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Verified",
							value: counts.tutors_verified,
							hint: `${counts.tutors_in_review} awaiting review`,
							icon: BadgeCheck
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Upcoming lessons",
							value: counts.upcoming_bookings,
							hint: `${counts.completed_lessons} completed`,
							icon: CalendarDays
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Agency balance",
							value: earnings ? formatMoney(earnings.availableBalance, earnings.currency) : "—",
							...earnings ? { hint: `${Number(earnings.revenueSharePercentage)}% share of tutor earnings` } : {},
							icon: Wallet
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Your tutors",
					description: "Verification is done by DiaLearn. Tutors appear in search once they and your agency are verified.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "min-h-11 sm:min-h-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/agency/tutors",
							children: "View all"
						})
					}),
					children: tutors.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 2 }) : tutors.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
						message: "We couldn't load your tutors.",
						onRetry: () => void tutors.refetch()
					}) : roster.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
						icon: Users,
						title: "No tutors yet",
						body: "Add your first tutor. We'll email them a link to set their password, and you can complete their profile for them.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "cta",
							className: "min-h-11",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/agency/tutors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Add a tutor"]
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: roster.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/agency/tutors/$tutorId",
									params: { tutorId: tutor.tutorId },
									className: "focus-ring truncate rounded font-medium hover:underline",
									children: tutor.fullName ?? tutor.email ?? "Tutor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										tutor.lessonsCompleted,
										" lessons ·",
										" ",
										formatMoney(tutor.grossAmount, tutor.currency),
										" billed"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", VERIFICATION_TONE[tutor.verificationStatus]),
								children: tutor.isListed ? "Listed" : VERIFICATION_LABEL[tutor.verificationStatus]
							})]
						}, tutor.tutorId))
					})
				}),
				data && data.agency.verificationStatus !== "verified" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
					title: "Agency verification",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								className: "mt-0.5 size-5 shrink-0 text-primary",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "DiaLearn checks your business registration and agency agreement before any of your tutors are listed."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "min-h-11 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/agency/profile",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Review agency details"]
							})
						})]
					})
				}) : null
			]
		})
	});
}
//#endregion
export { AgencyDashboardPage as component };
