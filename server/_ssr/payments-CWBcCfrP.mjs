import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { F as Receipt, Mt as CreditCard } from "../_libs/lucide-react.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as usePayments, O as useViewerTimezone, a as formatDayInZone, h as useBookings, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as KpiSkeletonGrid, c as PaymentStatusBadge, i as KpiCard, l as SectionCard, n as CardSkeletonList, o as LoadError, r as EmptyPanel } from "./ui-bAhnOVkK.mjs";
import { t as ParentShell } from "./ParentShell-C4Q6P4BE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-CWBcCfrP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Money only adds up within one currency, so totals are kept per currency. */
function totalsByCurrency(payments, predicate) {
	const totals = /* @__PURE__ */ new Map();
	for (const payment of payments.filter(predicate)) totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + payment.amount);
	return [...totals.entries()];
}
function formatTotals(totals) {
	if (totals.length === 0) return formatMoney(0, "USD");
	return totals.map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}
function PaymentsPage() {
	const timezone = useViewerTimezone();
	const payments = usePayments();
	const bookings = useBookings();
	const bookingById = (0, import_react.useMemo)(() => new Map((bookings.data ?? []).map((booking) => [booking.id, booking])), [bookings.data]);
	const rows = (0, import_react.useMemo)(() => [...payments.data ?? []].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [payments.data]);
	const paidTotals = totalsByCurrency(rows, (p) => p.status === "paid");
	const refundedTotals = totalsByCurrency(rows.filter((p) => p.refunded_amount > 0), () => true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ParentShell, {
		title: "Payments",
		description: "Every charge and refund on your family account, newest first.",
		children: [payments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiSkeletonGrid, { count: 3 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					label: "Paid",
					value: formatTotals(paidTotals),
					icon: CreditCard
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					label: "Payments",
					value: String(rows.length),
					icon: Receipt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
					label: "Refunded",
					value: formatTotals(refundedTotals),
					icon: Receipt
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
			title: "Payment history",
			description: "Charges are taken per lesson. Refunds follow the cancellation policy on the booking.",
			children: payments.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeletonList, {
				rows: 3,
				height: "h-20"
			}) : payments.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
				message: "We couldn't load your payments right now.",
				onRetry: () => void payments.refetch()
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyPanel, {
				icon: CreditCard,
				title: "No payments yet",
				body: "Once you book a lesson and pay for it, the charge appears here.",
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
				className: "divide-y divide-border",
				children: rows.map((payment) => {
					const booking = bookingById.get(payment.booking_id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center gap-3 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold text-foreground",
									children: [booking?.subjects?.name ?? "Lesson", booking ? ` · ${booking.duration_minutes} min` : ""]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [payment.paid_at ? `Paid ${formatDayInZone(payment.paid_at, timezone)}` : `Created ${formatDayInZone(payment.created_at, timezone)}`, payment.refunded_amount > 0 ? ` · ${formatMoney(payment.refunded_amount, payment.currency)} refunded` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold tabular-nums",
								children: formatMoney(payment.amount, payment.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentStatusBadge, { status: payment.status })
						]
					}, payment.id);
				})
			})
		})]
	});
}
//#endregion
export { PaymentsPage as component };
