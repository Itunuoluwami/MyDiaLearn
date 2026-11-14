import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { At as Download, E as ShieldAlert } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { i as useAdminBookings, p as useAdminUsers, s as useAdminPayments, u as useAdminReportSummary } from "./admin-data-uZ6jnAG3.mjs";
import { n as toCsv, t as downloadCsv } from "./csv-DYK3q72x.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reports-CVRxDjM9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isoDate(date) {
	return date.toISOString().slice(0, 10);
}
function StatTile({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xl font-bold tabular-nums text-foreground",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-muted-foreground",
			children: label
		})]
	});
}
function AdminReportsPage() {
	const { hasPermission, loading } = useAuth();
	const today = (0, import_react.useMemo)(() => /* @__PURE__ */ new Date(), []);
	const monthAgo = (0, import_react.useMemo)(() => /* @__PURE__ */ new Date(today.getTime() - 2592e6), [today]);
	const [fromDate, setFromDate] = (0, import_react.useState)(isoDate(monthAgo));
	const [toDate, setToDate] = (0, import_react.useState)(isoDate(today));
	const fromIso = `${fromDate}T00:00:00.000Z`;
	const toIso = `${toDate}T23:59:59.999Z`;
	const summary = useAdminReportSummary(fromIso, toIso);
	const bookings = useAdminBookings({
		from: fromIso,
		to: toIso
	});
	const payments = useAdminPayments({
		from: fromIso,
		to: toIso
	});
	const users = useAdminUsers({
		from: fromIso,
		to: toIso
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Reports",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.settings") && !hasPermission("admin.users")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Reports",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include reporting permissions."
			})] })]
		})
	});
	const s = summary.data;
	function exportBookings() {
		const rows = bookings.data ?? [];
		const csv = toCsv(rows.map((b) => ({
			starts_at: b.starts_at,
			status: b.status,
			student: `${b.students?.first_name ?? ""} ${b.students?.last_name ?? ""}`.trim(),
			tutor: b.tutors?.profiles?.full_name ?? "",
			subject: b.subjects?.name ?? "",
			amount: b.total_amount,
			currency: b.currency
		})), [
			{
				key: "starts_at",
				label: "Starts at"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "student",
				label: "Student"
			},
			{
				key: "tutor",
				label: "Tutor"
			},
			{
				key: "subject",
				label: "Subject"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "currency",
				label: "Currency"
			}
		]);
		downloadCsv(`bookings_${fromDate}_to_${toDate}.csv`, csv);
	}
	function exportPayments() {
		const rows = payments.data ?? [];
		const csv = toCsv(rows.map((p) => ({
			created_at: p.created_at,
			status: p.status,
			amount: p.amount,
			refunded_amount: p.refunded_amount,
			currency: p.currency,
			provider: p.provider ?? ""
		})), [
			{
				key: "created_at",
				label: "Created at"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "refunded_amount",
				label: "Refunded"
			},
			{
				key: "currency",
				label: "Currency"
			},
			{
				key: "provider",
				label: "Provider"
			}
		]);
		downloadCsv(`payments_${fromDate}_to_${toDate}.csv`, csv);
	}
	function exportUsers() {
		const rows = users.data ?? [];
		const csv = toCsv(rows.map((u) => ({
			full_name: u.full_name ?? "",
			email: u.email ?? "",
			primary_role: u.primary_role,
			is_active: u.is_active,
			created_at: u.created_at
		})), [
			{
				key: "full_name",
				label: "Name"
			},
			{
				key: "email",
				label: "Email"
			},
			{
				key: "primary_role",
				label: "Role"
			},
			{
				key: "is_active",
				label: "Active"
			},
			{
				key: "created_at",
				label: "Joined"
			}
		]);
		downloadCsv(`new_users_${fromDate}_to_${toDate}.csv`, csv);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Reports",
		description: "Growth, revenue, engagement and quality for a chosen window — export any table below as CSV.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "report-from",
						children: "From"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "report-from",
						type: "date",
						value: fromDate,
						onChange: (e) => setFromDate(e.target.value),
						max: toDate
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "report-to",
						children: "To"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "report-to",
						type: "date",
						value: toDate,
						onChange: (e) => setToDate(e.target.value),
						min: fromDate
					})]
				})]
			}), summary.isLoading || !s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: "Loading…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "New students",
						value: String(s.new_students ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "New parents",
						value: String(s.new_parents ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "New tutors",
						value: String(s.new_tutors ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Active users",
						value: String(s.active_users ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Bookings",
						value: String(s.bookings_count ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Completed",
						value: String(s.completed_count ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Cancelled",
						value: String(s.cancelled_count ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "No-shows",
						value: String(s.no_show_count ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "GMV",
						value: formatMoney(s.gmv, s.gmv_currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Commission revenue",
						value: formatMoney(s.commission_revenue, s.gmv_currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Avg transaction",
						value: formatMoney(s.avg_transaction_value, s.gmv_currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
						label: "Avg tutor rating",
						value: s.avg_tutor_rating != null ? String(s.avg_tutor_rating) : "—"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportBookings,
						disabled: bookings.isLoading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export bookings CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportPayments,
						disabled: payments.isLoading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export payments CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportUsers,
						disabled: users.isLoading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export new users CSV"]
					})
				]
			})] })]
		})
	});
}
//#endregion
export { AdminReportsPage as component };
