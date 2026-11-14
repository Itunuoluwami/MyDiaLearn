import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { It as Clock, Qt as CalendarDays, r as Video } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as useViewerTimezone, a as formatDayInZone, l as formatTimeInZone } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { c as useStudentBookings, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.schedule-CeeJvznW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** A lesson is joinable from fifteen minutes before it starts. */
var JOIN_WINDOW_MS = 9e5;
function SchedulePage() {
	const timezone = useViewerTimezone();
	const bookings = useStudentBookings({ statuses: [
		"pending",
		"confirmed",
		"in_progress"
	] });
	const now = Date.now();
	const days = (0, import_react.useMemo)(() => {
		const upcoming = (bookings.data ?? []).filter((booking) => new Date(booking.ends_at).getTime() > now).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
		const grouped = /* @__PURE__ */ new Map();
		for (const booking of upcoming) {
			const label = formatDayInZone(booking.starts_at, timezone);
			grouped.set(label, [...grouped.get(label) ?? [], booking]);
		}
		return [...grouped.entries()];
	}, [bookings.data, timezone]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "🗓️ Schedule",
		description: `Your upcoming lessons · times shown in ${timezone}`,
		children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-2xl" }, index))
		}) : days.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-6xl",
					children: "🗓️"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "Nothing scheduled"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "When a lesson is booked it appears here, in your own timezone, with a join button when it is nearly time."
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
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: days.map(([day, lessons]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
					className: "size-4 text-primary",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-extrabold uppercase tracking-wide",
					children: day
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: lessons.map((lesson) => {
					const starts = new Date(lesson.starts_at).getTime();
					const joinable = lesson.status !== "pending" && starts - now <= JOIN_WINDOW_MS;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
									className: "size-5",
									"aria-hidden": "true"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-extrabold text-foreground",
									children: [lesson.subjects?.name ?? "Lesson", lesson.tutors?.profiles?.full_name ? ` with ${lesson.tutors.profiles.full_name}` : ""]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										formatTimeInZone(lesson.starts_at, timezone),
										" –",
										" ",
										formatTimeInZone(lesson.ends_at, timezone),
										" · ",
										lesson.duration_minutes,
										" ",
										"min",
										lesson.status === "pending" ? " · awaiting payment" : ""
									]
								})]
							}),
							joinable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "sm",
								className: "min-h-11 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/student/classroom/$bookingId",
									params: { bookingId: lesson.id },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }), " Join"]
								})
							}) : null
						]
					}, lesson.id);
				})
			})] }, day))
		})
	});
}
//#endregion
export { SchedulePage as component };
