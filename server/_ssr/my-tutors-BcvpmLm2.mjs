import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { J as MessageSquare, Qt as CalendarDays, c as UserRound, k as Search, y as Star } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as useTutorCards, O as useViewerTimezone, _ as useChildren, a as formatDayInZone, h as useBookings, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, s as MetaItem, u as VerifiedChip } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
import { t as ChildSwitcher } from "./ChildSwitcher-D_zmULnc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-tutors-BcvpmLm2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function summarise(bookings) {
	const now = Date.now();
	const byTutor = /* @__PURE__ */ new Map();
	for (const booking of bookings) {
		const entry = byTutor.get(booking.tutor_id) ?? {
			tutorId: booking.tutor_id,
			lessonsCompleted: 0,
			upcoming: null,
			lastLesson: null,
			childIds: /* @__PURE__ */ new Set()
		};
		entry.childIds.add(booking.student_id);
		if (booking.status === "completed") entry.lessonsCompleted += 1;
		const starts = new Date(booking.starts_at).getTime();
		if (starts > now && [
			"confirmed",
			"in_progress",
			"pending"
		].includes(booking.status)) {
			if (!entry.upcoming || starts < new Date(entry.upcoming.starts_at).getTime()) entry.upcoming = booking;
		}
		if (starts <= now) {
			if (!entry.lastLesson || starts > new Date(entry.lastLesson.starts_at).getTime()) entry.lastLesson = booking;
		}
		byTutor.set(booking.tutor_id, entry);
	}
	return [...byTutor.values()].sort((a, b) => {
		if (Boolean(a.upcoming) !== Boolean(b.upcoming)) return a.upcoming ? -1 : 1;
		return b.lessonsCompleted - a.lessonsCompleted;
	});
}
function MyTutorsPage() {
	const timezone = useViewerTimezone();
	const children = useChildren();
	const [childId, setChildId] = (0, import_react.useState)(null);
	const bookings = useBookings(childId ? { studentId: childId } : void 0);
	const history = (0, import_react.useMemo)(() => summarise(bookings.data ?? []), [bookings.data]);
	const tutors = useTutorCards(history.map((entry) => entry.tutorId));
	const childName = (0, import_react.useMemo)(() => {
		const map = new Map((children.data ?? []).map((child) => [child.id, child.first_name]));
		return (id) => map.get(id) ?? "your child";
	}, [children.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ParentShell, {
		title: "Your tutors",
		description: "Everyone currently teaching your family, and when you next see them.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/find-tutor",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Find another tutor"]
			})
		}),
		children: [(children.data ?? []).length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChildSwitcher, {
			children: children.data ?? [],
			selectedId: childId,
			onSelect: setChildId,
			className: "mb-5"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Tutors you have booked",
			description: "Built from your family's bookings — a tutor appears here once you book them.",
			children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 2,
				height: "h-28"
			}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your tutors right now.",
				onRetry: () => void bookings.refetch()
			}) : history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: UserRound,
				title: "No tutors yet",
				body: "Once you book a lesson, the tutor appears here with your lesson history together.",
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
				className: "space-y-3",
				children: history.map((entry) => {
					const tutor = tutors.map.get(entry.tutorId);
					const names = [...entry.childIds].map(childName).join(", ");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 items-start gap-3",
							children: [tutor?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: tutor.avatar_url,
								alt: tutor.full_name ?? "Tutor",
								className: "size-12 rounded-2xl object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary-deep",
								children: (tutor?.full_name ?? "T").charAt(0).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-foreground",
											children: tutor?.full_name ?? "Tutor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedChip, { status: tutor?.verification_status ?? null })]
									}),
									tutor?.headline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-muted-foreground",
										children: tutor.headline
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex flex-wrap gap-x-4 gap-y-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
												icon: UserRound,
												children: ["Teaching ", names]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaItem, {
												icon: Star,
												children: entry.lessonsCompleted === 1 ? "1 lesson completed" : `${entry.lessonsCompleted} lessons completed`
											}),
											tutor?.hourly_rate != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MetaItem, {
												icon: CalendarDays,
												children: [formatMoney(tutor.hourly_rate, tutor.currency), " / hour"]
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: entry.upcoming ? `Next lesson ${formatDayInZone(entry.upcoming.starts_at, timezone)}` : entry.lastLesson ? `Last lesson ${formatDayInZone(entry.lastLesson.starts_at, timezone)}` : "No lessons scheduled"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/messages",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4" }), " Message"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								size: "sm",
								className: "min-h-11 sm:min-h-10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/book/$tutorId",
									params: { tutorId: entry.tutorId },
									children: "Book again"
								})
							})]
						})]
					}, entry.tutorId);
				})
			})
		})]
	});
}
//#endregion
export { MyTutorsPage as component };
