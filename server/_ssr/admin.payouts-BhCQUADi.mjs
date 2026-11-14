import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, E as ShieldAlert, Ht as CircleCheck, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { b as useRejectPayout, c as useAdminPayouts, k as useSettlePayout } from "./admin-data-uZ6jnAG3.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.payouts-BhCQUADi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_FILTERS = [
	"all",
	"requested",
	"processing",
	"paid",
	"rejected",
	"cancelled"
];
var STATUS_LABEL = {
	requested: "Requested",
	processing: "Processing",
	paid: "Paid",
	rejected: "Rejected",
	cancelled: "Cancelled"
};
var STATUS_TONE = {
	requested: "bg-secondary-soft text-foreground",
	processing: "bg-primary-soft text-primary-deep",
	paid: "bg-success/12 text-success",
	rejected: "bg-destructive/12 text-destructive",
	cancelled: "bg-muted text-muted-foreground"
};
function AdminPayoutsPage() {
	const { hasPermission, loading } = useAuth();
	const [status, setStatus] = (0, import_react.useState)("requested");
	const payouts = useAdminPayouts({ status });
	const settle = useSettlePayout();
	const reject = useRejectPayout();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Payouts",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.payouts")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Payouts",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include payout management permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Payouts",
		description: "Tutor payout requests, from request to settlement.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: status,
				onValueChange: (value) => setStatus(value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "sm:w-52",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_FILTERS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: option,
					children: option === "all" ? "All statuses" : STATUS_LABEL[option]
				}, option)) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Requested" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tutor" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Amount" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Settled" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: payouts.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-sm text-muted-foreground",
					children: "Loading…"
				}) }) : (payouts.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-sm text-muted-foreground",
					children: "No payout requests here."
				}) }) : (payouts.data ?? []).map((payout) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-nowrap text-muted-foreground",
						children: new Date(payout.requested_at).toLocaleDateString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: payout.tutors?.profiles?.full_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatMoney(payout.amount, payout.currency) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: STATUS_TONE[payout.status],
						children: STATUS_LABEL[payout.status]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground",
						children: payout.settled_at ? new Date(payout.settled_at).toLocaleDateString() : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: payout.status === "requested" || payout.status === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-destructive",
								disabled: reject.isPending,
								onClick: () => reject.mutate(payout.id, {
									onSuccess: () => toast.success("Payout rejected"),
									onError: (error) => toast.error(error.message)
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Reject"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: settle.isPending,
								onClick: () => settle.mutate(payout.id, {
									onSuccess: () => toast.success("Payout marked as paid"),
									onError: (error) => toast.error(error.message)
								}),
								children: [settle.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Mark paid"]
							})]
						}) : null
					})
				] }, payout.id)) })] })
			})]
		})
	});
}
//#endregion
export { AdminPayoutsPage as component };
