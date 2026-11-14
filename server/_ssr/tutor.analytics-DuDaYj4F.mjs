import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Xt as ChartColumn, a as Users, en as CalendarCheck, h as TrendingUp, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useTutorSummary, p as useTutorBookings } from "./tutor-data-BgedrW1M.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList } from "./ui-bAhnOVkK.mjs";
import { S as useRatingSummary, m as useEarningsSummary, x as useRatingCategories } from "./tutor-workspace-DMY2LNJP.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.analytics-DuDaYj4F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function percent(part, whole) {
	return whole === 0 ? 0 : Math.round(part / whole * 100);
}
function AnalyticsPage() {
	const summary = useTutorSummary();
	const bookings = useTutorBookings();
	const earnings = useEarningsSummary();
	const ratings = useRatingSummary();
	const categories = useRatingCategories();
	/**
	* Counted from the tutor's own bookings rather than a separate report, so
	* these figures can never disagree with the classes list on the next page.
	*/
	const stats = (0, import_react.useMemo)(() => {
		const rows = bookings.data ?? [];
		const settled = rows.filter((row) => [
			"completed",
			"cancelled",
			"no_show"
		].includes(row.status));
		const completed = rows.filter((row) => row.status === "completed").length;
		const cancelled = rows.filter((row) => row.status === "cancelled").length;
		const noShow = rows.filter((row) => row.status === "no_show").length;
		const minutes = rows.filter((row) => row.status === "completed").reduce((sum, row) => sum + row.duration_minutes, 0);
		return {
			total: rows.length,
			completed,
			cancelled,
			noShow,
			settled: settled.length,
			hoursTaught: Math.round(minutes / 60 * 10) / 10,
			completionRate: percent(completed, settled.length),
			cancellationRate: percent(cancelled, settled.length)
		};
	}, [bookings.data]);
	const rating = ratings.data;
	const distribution = rating ? [
		["5", rating.five_star],
		["4", rating.four_star],
		["3", rating.three_star],
		["2", rating.two_star],
		["1", rating.one_star]
	] : [];
	const ratingTotal = rating?.rating_count ?? 0;
	const loading = summary.isLoading || bookings.isLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TutorShell, {
		title: "Analytics",
		description: "How your teaching is going, from your own lessons and reviews.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/tutor/earnings",
				children: "Open earnings"
			})
		}),
		children: [
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 4 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Lessons delivered",
						value: String(stats.completed),
						hint: `${stats.hoursTaught} hours taught`,
						icon: CalendarCheck
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Active students",
						value: String(summary.data?.active_students ?? 0),
						icon: Users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Net earned",
						value: formatMoney(earnings.data?.net_earnings ?? 0, earnings.data?.currency ?? summary.data?.currency ?? "USD"),
						hint: "After commission and fees",
						icon: TrendingUp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Average rating",
						value: ratingTotal === 0 ? "—" : Number(rating?.rating_avg ?? 0).toFixed(1),
						hint: ratingTotal === 0 ? "No reviews yet" : ratingTotal === 1 ? "From 1 review" : `From ${ratingTotal} reviews`,
						icon: Star
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "Reliability",
				description: "Counted across every lesson that has reached an outcome — completed, cancelled or a no-show.",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 2,
					height: "h-12"
				}) : stats.settled === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nothing to measure yet. These fill in once your first lessons finish."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Completion rate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-muted-foreground",
								children: [
									stats.completionRate,
									"% · ",
									stats.completed,
									" of ",
									stats.settled
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: stats.completionRate,
							className: "h-2"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Cancellation rate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-muted-foreground",
								children: [
									stats.cancellationRate,
									"% · ",
									stats.cancelled,
									" cancelled"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: stats.cancellationRate,
							className: "h-2"
						})] }),
						stats.noShow > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [stats.noShow === 1 ? "1 no-show" : `${stats.noShow} no-shows`, " recorded."]
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "What families rate you on",
				description: "Scores families give per category after a lesson.",
				children: categories.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-10"
				}) : (categories.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No category scores yet — they appear once families start reviewing your lessons."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-4",
					children: (categories.data ?? []).map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1.5 flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: category.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: [Number(category.average_score).toFixed(1), " / 5"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: Number(category.average_score) / 5 * 100,
						className: "h-2"
					})] }, category.name))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "Rating spread",
				description: "How your reviews are distributed.",
				children: ratings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-8"
				}) : ratingTotal === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 py-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
							className: "size-6",
							"aria-hidden": "true"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Reviews appear here once families have rated your completed lessons."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: distribution.map(([stars, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "w-10 shrink-0 text-sm font-semibold tabular-nums",
								children: [stars, " ★"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: percent(count, ratingTotal),
								className: "h-2 flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground",
								children: count
							})
						]
					}, stars))
				})
			})
		]
	});
}
//#endregion
export { AnalyticsPage as component };
