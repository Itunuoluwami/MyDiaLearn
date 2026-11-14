import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, E as ShieldAlert, Ht as CircleCheck, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { S as useResolveDispute, o as useAdminDisputes } from "./admin-data-uZ6jnAG3.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.disputes-DJ7XphcH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_FILTERS = [
	"open",
	"investigating",
	"resolved",
	"dismissed",
	"all"
];
var STATUS_LABEL = {
	open: "Open",
	investigating: "Investigating",
	resolved: "Resolved",
	dismissed: "Dismissed"
};
var STATUS_TONE = {
	open: "bg-destructive/12 text-destructive",
	investigating: "bg-primary-soft text-primary-deep",
	resolved: "bg-success/12 text-success",
	dismissed: "bg-muted text-muted-foreground"
};
var CATEGORY_LABEL = {
	payment: "Payment",
	conduct: "Conduct",
	quality: "Lesson quality",
	scheduling: "Scheduling",
	other: "Other"
};
function DisputeCard({ dispute }) {
	const [notes, setNotes] = (0, import_react.useState)(dispute.resolution_notes ?? "");
	const resolve = useResolveDispute();
	const raisedBy = dispute.raised_by_profile?.full_name ?? "Unknown";
	const against = dispute.against_profile?.full_name;
	const subject = dispute.bookings?.subjects?.name;
	const open = dispute.status === "open" || dispute.status === "investigating";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium",
					children: [raisedBy, against ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [" vs ", against]
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: [
						CATEGORY_LABEL[dispute.category] ?? dispute.category,
						subject ? ` · ${subject}` : "",
						" · ",
						new Date(dispute.created_at).toLocaleDateString()
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: STATUS_TONE[dispute.status],
					children: STATUS_LABEL[dispute.status]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: dispute.description
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Resolution notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 2,
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-end gap-2 pt-1",
						children: [
							dispute.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: resolve.isPending,
								onClick: () => resolve.mutate({
									disputeId: dispute.id,
									status: "investigating",
									notes
								}, { onError: (error) => toast.error(error.message) }),
								children: "Start investigating"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-muted-foreground",
								disabled: resolve.isPending,
								onClick: () => resolve.mutate({
									disputeId: dispute.id,
									status: "dismissed",
									notes
								}, {
									onSuccess: () => toast.success("Dispute dismissed"),
									onError: (error) => toast.error(error.message)
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Dismiss"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: resolve.isPending,
								onClick: () => resolve.mutate({
									disputeId: dispute.id,
									status: "resolved",
									notes
								}, {
									onSuccess: () => toast.success("Dispute resolved"),
									onError: (error) => toast.error(error.message)
								}),
								children: [resolve.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Mark resolved"]
							})
						]
					})
				]
			}) : dispute.resolution_notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground",
				children: ["Resolution: ", dispute.resolution_notes]
			}) : null
		]
	});
}
function AdminDisputesPage() {
	const { hasPermission, loading } = useAuth();
	const [status, setStatus] = (0, import_react.useState)("open");
	const disputes = useAdminDisputes(status);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Disputes",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.disputes")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Disputes",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include dispute resolution permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Disputes",
		description: "Raised via raise_dispute() by a party to a booking. No portal has a 'report an issue' button wired up to it yet, so this queue reflects only what's been raised directly.",
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
				className: cn("mt-5 space-y-3"),
				children: disputes.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading…"
				}) : (disputes.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No disputes in this view."
				}) : (disputes.data ?? []).map((dispute) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisputeCard, { dispute }, dispute.id))
			})]
		})
	});
}
//#endregion
export { AdminDisputesPage as component };
