import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Qt as CalendarDays } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { s as formatMoney, t as BOOKING_STATUS_LABEL } from "./parent-data-Dj0LJH5W.mjs";
import { o as useAgencyBookings, t as AgencyShell } from "./AgencyShell-DfnQMswl.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel, t as BookingStatusBadge } from "./ui-bAhnOVkK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency.bookings-DJnrUrjf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"all",
	"pending",
	"confirmed",
	"in_progress",
	"completed",
	"cancelled",
	"no_show"
];
function AgencyBookingsPage() {
	const [status, setStatus] = (0, import_react.useState)("all");
	const bookings = useAgencyBookings({ status });
	const rows = bookings.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgencyShell, {
		title: "Bookings",
		description: "Every lesson booked with your tutors, newest first.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: status,
			onValueChange: (value) => setStatus(value),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "min-h-11 w-44",
				"aria-label": "Filter by status",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: item,
				children: item === "all" ? "All bookings" : BOOKING_STATUS_LABEL[item]
			}, item)) })]
		}),
		children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
			rows: 4,
			height: "h-16"
		}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
			message: bookings.error.message || "We couldn't load bookings.",
			onRetry: () => void bookings.refetch()
		}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
			icon: CalendarDays,
			title: "No bookings yet",
			body: "Lessons appear here as soon as families book your tutors."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: `${rows.length} booking${rows.length === 1 ? "" : "s"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm font-semibold",
							children: [row.tutor_name ?? "Tutor", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-normal text-muted-foreground",
								children: [
									" ",
									"with ",
									row.student_first_name ?? "a student",
									row.subject_name ? ` · ${row.subject_name}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								new Date(row.starts_at).toLocaleString(void 0, {
									dateStyle: "medium",
									timeStyle: "short"
								}),
								" ",
								"· ",
								row.duration_minutes,
								" min"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm tabular-nums",
								children: formatMoney(row.total_amount, row.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: row.paid ? "Paid" : "Unpaid"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingStatusBadge, { status: row.status })
						]
					})]
				}, row.id))
			})
		})
	});
}
//#endregion
export { AgencyBookingsPage as component };
