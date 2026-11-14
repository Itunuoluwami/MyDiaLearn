import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { It as Clock, Yt as ChartLine, in as BookOpen, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as useChildren, g as useChildProgress } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ChildSwitcher } from "./ChildSwitcher-D_zmULnc.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-D_nBHcIv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Attendance as a percentage, or null when there is nothing to divide by. */
function attendanceRate(row) {
	const seen = row.attended_count + row.missed_count;
	if (seen === 0) return null;
	return Math.round(row.attended_count / seen * 100);
}
function hours(minutes) {
	if (minutes < 60) return `${minutes}m`;
	const whole = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${whole}h` : `${whole}h ${rest}m`;
}
function ProgressPage() {
	const children = useChildren();
	const kids = (0, import_react.useMemo)(() => children.data ?? [], [children.data]);
	const [childId, setChildId] = (0, import_react.useState)(null);
	const selectedId = childId ?? kids[0]?.id;
	const progress = useChildProgress(selectedId);
	const rows = progress.data ?? [];
	const totals = (0, import_react.useMemo)(() => {
		const completed = rows.reduce((sum, row) => sum + row.completed_lessons, 0);
		const minutes = rows.reduce((sum, row) => sum + row.learning_minutes, 0);
		const attended = rows.reduce((sum, row) => sum + row.attended_count, 0);
		const missed = rows.reduce((sum, row) => sum + row.missed_count, 0);
		const rated = rows.map((row) => Number(row.avg_rating)).filter((value) => value > 0);
		return {
			completed,
			minutes,
			attendance: attended + missed === 0 ? null : Math.round(attended / (attended + missed) * 100),
			rating: rated.length === 0 ? null : rated.reduce((a, b) => a + b, 0) / rated.length
		};
	}, [rows]);
	const selectedChild = kids.find((child) => child.id === selectedId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParentShell, {
		title: "Learning progress",
		description: "Lessons, attendance and tutor ratings for each subject your child studies.",
		children: kids.length === 0 && !children.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Progress",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: ChartLine,
				title: "No children yet",
				body: "Add a learner to your family account and their progress will build up here as they take lessons.",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					className: "min-h-11",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/children",
						children: "Add a child"
					})
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			kids.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildSwitcher, {
				children: kids,
				selectedId: selectedId ?? null,
				onSelect: setChildId,
				allowAll: false,
				className: "mb-5"
			}) : null,
			progress.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 4 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Lessons completed",
						value: String(totals.completed),
						icon: BookOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Time learning",
						value: hours(totals.minutes),
						icon: Clock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Attendance",
						value: totals.attendance === null ? "—" : `${totals.attendance}%`,
						icon: ChartLine
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Average rating",
						value: totals.rating === null ? "—" : totals.rating.toFixed(1),
						hint: totals.rating === null ? "No ratings yet" : "Given by tutors",
						icon: Star
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				title: "By subject",
				description: selectedChild ? `How ${selectedChild.first_name} is doing in each subject they study.` : "How your child is doing in each subject.",
				children: progress.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 2,
					height: "h-20"
				}) : progress.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load this child's progress right now.",
					onRetry: () => void progress.refetch()
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
					icon: BookOpen,
					title: "Nothing to report yet",
					body: "Progress appears here once your child has had their first lesson.",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						className: "min-h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/find-tutor",
							children: "Find a tutor"
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-4",
					children: rows.map((row) => {
						const rate = attendanceRate(row);
						const rating = Number(row.avg_rating);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-2xl border border-border bg-card p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-extrabold text-foreground",
										children: row.subject_name
									}), rating > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-sm font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											className: "size-4 text-warning",
											"aria-hidden": "true"
										}), rating.toFixed(1)]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Completed"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold tabular-nums",
											children: row.completed_lessons
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Scheduled"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold tabular-nums",
											children: row.scheduled_lessons
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Time learning"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold tabular-nums",
											children: hours(row.learning_minutes)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Missed"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-semibold tabular-nums",
											children: row.missed_count
										})] })
									]
								}),
								rate !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1.5 flex items-center justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Attendance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold tabular-nums",
											children: [rate, "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
										value: rate,
										className: "h-2"
									})]
								}) : null
							]
						}, row.subject_id);
					})
				})
			})
		] })
	});
}
//#endregion
export { ProgressPage as component };
