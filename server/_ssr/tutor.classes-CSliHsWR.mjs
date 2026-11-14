import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { Zt as CalendarPlus, mt as Inbox } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { d as useRespondToBooking, p as useTutorBookings, v as useTutorTimezone } from "./tutor-data-BgedrW1M.mjs";
import { a as formatDayInZone } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as TutorShell } from "./TutorShell-Cw8Ozq-q.mjs";
import { t as TutorBookingCard } from "./TutorBookingCard-DRobNGBc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor.classes-CSliHsWR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TAB_COPY = {
	requests: {
		empty: "No lesson requests",
		body: "Keep your availability up to date so families can find and book your open hours."
	},
	upcoming: {
		empty: "No upcoming classes",
		body: "Confirmed lessons appear here once a family has booked and their payment has cleared."
	},
	past: {
		empty: "No past classes yet",
		body: "Completed lessons will be listed here with the learner, subject and your lesson notes."
	},
	cancelled: {
		empty: "Nothing cancelled",
		body: "Declined requests and cancelled lessons are kept here for your records."
	}
};
function TutorClassesPage() {
	const timezone = useTutorTimezone();
	const [view, setView] = (0, import_react.useState)("upcoming");
	const bookings = useTutorBookings();
	const respond = useRespondToBooking();
	const rows = bookings.data ?? [];
	const filtered = (0, import_react.useMemo)(() => {
		const now = Date.now();
		const liveStatuses = ["confirmed", "in_progress"];
		if (view === "requests") return rows.filter((row) => row.status === "pending" && new Date(row.ends_at).getTime() > now);
		if (view === "upcoming") return rows.filter((row) => new Date(row.ends_at).getTime() > now && liveStatuses.includes(row.status));
		if (view === "cancelled") return rows.filter((row) => row.status === "cancelled" || row.status === "rejected" || row.status === "no_show").sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
		return rows.filter((row) => row.status === "completed" || new Date(row.ends_at).getTime() <= now && row.status !== "cancelled" && row.status !== "rejected" && row.status !== "pending").sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
	}, [rows, view]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of filtered) {
			const key = formatDayInZone(row.starts_at, timezone);
			map.set(key, [...map.get(key) ?? [], row]);
		}
		return [...map.entries()];
	}, [filtered, timezone]);
	const requestCount = rows.filter((row) => row.status === "pending" && new Date(row.ends_at).getTime() > Date.now()).length;
	const awaitingPayment = rows.filter((row) => row.tutor_accepted_at && row.status === "pending" && row.payment_status !== "paid").length;
	async function handleRespond(bookingId, accept) {
		try {
			await respond.mutateAsync({
				bookingId,
				accept
			});
			toast.success(accept ? "Accepted — confirmed once payment clears" : "Request declined");
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			toast.error(message.includes("BOOKING_OVERLAP") ? "That slot clashes with another confirmed class." : "We couldn't update that request.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorShell, {
		title: "My classes",
		description: `Every lesson in your own timezone · ${timezone}`,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "min-h-11 sm:min-h-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/tutor/availability",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "size-4" }), " Availability"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-5xl space-y-5",
			children: [
				awaitingPayment > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-2xl border border-secondary/40 bg-secondary-soft/60 p-3 text-sm",
					children: [
						awaitingPayment,
						" accepted ",
						awaitingPayment === 1 ? "lesson is" : "lessons are",
						" waiting on the family's payment. They move to Upcoming automatically once payment succeeds."
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					value: view,
					onValueChange: (value) => setView(value),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full justify-start overflow-x-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "requests",
								className: "min-h-11",
								children: ["Requests", requestCount > 0 ? ` (${requestCount})` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "upcoming",
								className: "min-h-11",
								children: "Upcoming"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "past",
								className: "min-h-11",
								children: "Past"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "cancelled",
								className: "min-h-11",
								children: "Cancelled"
							})
						]
					})
				}),
				bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
					rows: 3,
					height: "h-40"
				}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: "We couldn't load your classes right now.",
					onRetry: () => void bookings.refetch()
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
					icon: Inbox,
					title: TAB_COPY[view].empty,
					body: TAB_COPY[view].body,
					action: view === "past" || view === "cancelled" ? void 0 : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "cta",
						className: "min-h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tutor/availability",
							children: "Set availability"
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-5",
					children: grouped.map(([day, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
						title: day,
						description: `${items.length} ${items.length === 1 ? "class" : "classes"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							children: items.map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorBookingCard, {
								booking,
								timezone,
								busy: respond.isPending,
								showLifecycle: view !== "past",
								...booking.status === "pending" && !booking.tutor_accepted_at ? {
									onAccept: () => void handleRespond(booking.id, true),
									onDecline: () => void handleRespond(booking.id, false)
								} : {}
							}, booking.id))
						})
					}, day))
				})
			]
		})
	});
}
//#endregion
export { TutorClassesPage as component };
