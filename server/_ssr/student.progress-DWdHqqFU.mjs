import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { It as Clock, Yt as ChartLine, in as BookOpen, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { t as Progress } from "./progress-CmdFJCtB.mjs";
import { o as useMyProgress, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.progress-DWdHqqFU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Attendance as a percentage, or null when nothing has happened yet. */
function attendance(row) {
	const seen = row.attended_count + row.missed_count;
	return seen === 0 ? null : Math.round(row.attended_count / seen * 100);
}
function hours(minutes) {
	if (minutes < 60) return `${minutes}m`;
	const whole = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${whole}h` : `${whole}h ${rest}m`;
}
function Stat({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-2xl font-extrabold tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: label
			})
		]
	});
}
function ProgressPage() {
	const progress = useMyProgress();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "📈 My Progress",
		description: "How you are doing, subject by subject.",
		children: progress.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl" }, index))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: BookOpen,
					label: "Classes done",
					value: String(totals.completed)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: Clock,
					label: "Time learning",
					value: hours(totals.minutes)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: ChartLine,
					label: "Attendance",
					value: totals.attendance === null ? "—" : `${totals.attendance}%`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: Star,
					label: "Average rating",
					value: totals.rating === null ? "—" : totals.rating.toFixed(1)
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-extrabold uppercase tracking-wide text-muted-foreground",
				children: "By subject"
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-5xl",
						children: "📚"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-extrabold text-foreground",
						children: "Nothing to show yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: "Your progress builds up here after your first lesson."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/student/find-tutor",
							children: "Find a tutor"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-3",
				children: rows.map((row) => {
					const rate = attendance(row);
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
			})]
		})] })
	});
}
//#endregion
export { ProgressPage as component };
