import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { At as Download, Xt as ChartColumn } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as usePayments, E as useTutorCards, O as useViewerTimezone, _ as useChildren, a as formatDayInZone, h as useBookings, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-OFzrTqMf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MONTH = new Intl.DateTimeFormat(void 0, {
	month: "long",
	year: "numeric"
});
function monthKey(iso) {
	return iso.slice(0, 7);
}
function buildMonths(bookings, paidByBooking) {
	const months = /* @__PURE__ */ new Map();
	for (const booking of bookings) {
		const key = monthKey(booking.starts_at);
		const row = months.get(key) ?? {
			key,
			label: MONTH.format(new Date(booking.starts_at)),
			lessons: 0,
			completed: 0,
			cancelled: 0,
			minutes: 0,
			spendByCurrency: /* @__PURE__ */ new Map()
		};
		row.lessons += 1;
		if (booking.status === "completed") {
			row.completed += 1;
			row.minutes += booking.duration_minutes;
		}
		if (booking.status === "cancelled") row.cancelled += 1;
		const payment = paidByBooking.get(booking.id);
		if (payment) row.spendByCurrency.set(payment.currency, (row.spendByCurrency.get(payment.currency) ?? 0) + payment.amount);
		months.set(key, row);
	}
	return [...months.values()].sort((a, b) => b.key.localeCompare(a.key));
}
function formatSpend(spend) {
	if (spend.size === 0) return "—";
	return [...spend.entries()].map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}
function toCsv(rows) {
	return [[
		"Month",
		"Lessons",
		"Completed",
		"Cancelled",
		"Minutes taught",
		"Spend"
	], ...rows.map((row) => [
		row.label,
		String(row.lessons),
		String(row.completed),
		String(row.cancelled),
		String(row.minutes),
		formatSpend(row.spendByCurrency).replace(/,/g, "")
	])].map((cells) => cells.map((c) => `"${c}"`).join(",")).join("\n");
}
function ReportsPage() {
	const timezone = useViewerTimezone();
	useChildren();
	const [childId, setChildId] = (0, import_react.useState)(null);
	const bookings = useBookings(childId ? { studentId: childId } : void 0);
	const payments = usePayments();
	const paidByBooking = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const payment of payments.data ?? []) {
			if (payment.status !== "paid") continue;
			const net = payment.amount - payment.refunded_amount;
			map.set(payment.booking_id, {
				amount: net,
				currency: payment.currency
			});
		}
		return map;
	}, [payments.data]);
	const rows = (0, import_react.useMemo)(() => buildMonths(bookings.data ?? [], paidByBooking), [bookings.data, paidByBooking]);
	const tutors = useTutorCards((bookings.data ?? []).map((booking) => booking.tutor_id));
	function handleDownload() {
		const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `dialearn-report-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
	const loading = bookings.isLoading || payments.isLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ParentShell, {
		title: "Reports",
		description: "A month-by-month view of your family's lessons and what they cost.",
		actions: rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: "min-h-11",
			onClick: handleDownload,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download CSV"]
		}) : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "By month",
			description: "Spend counts what was actually charged, less anything refunded.",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-16"
			}) : bookings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't build your report right now.",
				onRetry: () => void bookings.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: ChartColumn,
				title: "Nothing to report yet",
				body: "Once your family has lessons, this page summarises them month by month and lets you download the figures.",
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
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[34rem] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 pr-4 font-semibold",
								children: "Month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 pr-4 text-right font-semibold",
								children: "Lessons"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 pr-4 text-right font-semibold",
								children: "Completed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 pr-4 text-right font-semibold",
								children: "Cancelled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 pr-4 text-right font-semibold",
								children: "Taught"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "col",
								className: "py-2 text-right font-semibold",
								children: "Spend"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								scope: "row",
								className: "py-3 pr-4 text-left font-semibold",
								children: row.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-4 text-right tabular-nums",
								children: row.lessons
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-4 text-right tabular-nums",
								children: row.completed
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 pr-4 text-right tabular-nums",
								children: row.cancelled
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-3 pr-4 text-right tabular-nums",
								children: [Math.round(row.minutes / 60), "h"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 text-right font-semibold tabular-nums",
								children: formatSpend(row.spendByCurrency)
							})
						] }, row.key))
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Recent lessons",
			description: "The last ten lessons across your family, newest first.",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-14"
			}) : (bookings.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No lessons yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: [...bookings.data ?? []].sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()).slice(0, 10).map((booking) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold text-foreground",
							children: [
								booking.subjects?.name ?? "Lesson",
								" ·",
								" ",
								tutors.map.get(booking.tutor_id)?.full_name ?? "Tutor"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								formatDayInZone(booking.starts_at, timezone),
								" · ",
								booking.duration_minutes,
								" ",
								"min"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm tabular-nums text-muted-foreground",
						children: formatMoney(booking.total_amount, booking.currency)
					})]
				}, booking.id))
			})
		})]
	});
}
//#endregion
export { ReportsPage as component };
