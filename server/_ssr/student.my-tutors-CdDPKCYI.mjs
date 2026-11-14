import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { J as MessageSquare, Qt as CalendarDays, c as UserRound, k as Search, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as useViewerTimezone, a as formatDayInZone } from "./parent-data-Dj0LJH5W.mjs";
import { t as Skeleton } from "./skeleton-CgemGF6n.mjs";
import { c as useStudentBookings, t as StudentShell } from "./StudentShell-CJwiZRhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student.my-tutors-CdDPKCYI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** One entry per tutor, built from the learner's own bookings. */
function summarise(bookings) {
	const now = Date.now();
	const byTutor = /* @__PURE__ */ new Map();
	for (const booking of bookings) {
		const entry = byTutor.get(booking.tutor_id) ?? {
			tutorId: booking.tutor_id,
			name: booking.tutors?.profiles?.full_name ?? "Your tutor",
			avatar: booking.tutors?.profiles?.avatar_url ?? null,
			subjects: /* @__PURE__ */ new Set(),
			completed: 0,
			upcoming: null,
			last: null
		};
		if (booking.subjects?.name) entry.subjects.add(booking.subjects.name);
		if (booking.status === "completed") entry.completed += 1;
		const starts = new Date(booking.starts_at).getTime();
		if (starts > now && [
			"confirmed",
			"in_progress",
			"pending"
		].includes(booking.status)) {
			if (!entry.upcoming || starts < new Date(entry.upcoming.starts_at).getTime()) entry.upcoming = booking;
		} else if (!entry.last || starts > new Date(entry.last.starts_at).getTime()) entry.last = booking;
		byTutor.set(booking.tutor_id, entry);
	}
	return [...byTutor.values()].sort((a, b) => {
		if (Boolean(a.upcoming) !== Boolean(b.upcoming)) return a.upcoming ? -1 : 1;
		return b.completed - a.completed;
	});
}
function MyTutorsPage() {
	const timezone = useViewerTimezone();
	const bookings = useStudentBookings();
	const tutors = (0, import_react.useMemo)(() => summarise(bookings.data ?? []), [bookings.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentShell, {
		title: "👩🏽‍🏫 My Tutors",
		description: "Everyone who teaches you, and when you next meet.",
		children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 2 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-2xl" }, index))
		}) : tutors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-20 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-6xl",
					children: "🔍"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-extrabold text-foreground",
					children: "No tutors yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "Once you have a lesson booked, your tutor appears here with everything you have studied together."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "cta",
					className: "min-h-11 rounded-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/student/find-tutor",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Find a tutor"]
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: tutors.map((tutor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-start gap-3",
					children: [tutor.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: tutor.avatar,
						alt: tutor.name,
						className: "size-12 rounded-2xl object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary",
						children: tutor.name.charAt(0).toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-extrabold text-foreground",
								children: tutor.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: tutor.subjects.size > 0 ? [...tutor.subjects].join(", ") : "Lessons"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), tutor.completed === 1 ? "1 class together" : `${tutor.completed} classes together`]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), tutor.upcoming ? `Next ${formatDayInZone(tutor.upcoming.starts_at, timezone)}` : tutor.last ? `Last ${formatDayInZone(tutor.last.starts_at, timezone)}` : "Nothing scheduled"]
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/student/messages",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), " Message"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						size: "sm",
						className: "min-h-11 rounded-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/student/book/$tutorId",
							params: { tutorId: tutor.tutorId },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }), " Book again"]
						})
					})]
				})]
			}, tutor.tutorId))
		})
	});
}
//#endregion
export { MyTutorsPage as component };
