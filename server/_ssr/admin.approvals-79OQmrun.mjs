import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, E as ShieldAlert, Ht as CircleCheck, It as Clock, T as ShieldCheck, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { a as REQUEST_STATUS_TONE, d as summarizeRequestPayload, f as useActionRequests, i as REQUEST_STATUS_LABEL, o as friendlyAdminError, r as REQUEST_ACTION_LABEL, y as useReviewActionRequest } from "./admin-governance-AZIEy_jw.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.approvals-79OQmrun.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function relativeAge(iso) {
	const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 6e4));
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function ReviewDialog({ request, approve, onClose }) {
	const review = useReviewActionRequest();
	const [notes, setNotes] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: approve ? "Approve this action?" : "Reject this action?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				REQUEST_ACTION_LABEL[request.action],
				" —",
				" ",
				summarizeRequestPayload(request.action, request.payload)
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-1",
				children: [approve ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md bg-secondary-soft px-3 py-2.5 text-sm text-foreground",
					children: "Approving applies this immediately and permanently. Both the request and its effect are recorded in the audit log against your name."
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "review-notes",
						children: ["Notes ", approve ? "(optional)" : "— say why"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "review-notes",
						rows: 3,
						placeholder: approve ? "Anything worth recording alongside this decision" : "The reason you're turning this down",
						value: notes,
						onChange: (event) => setNotes(event.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: approve ? "default" : "destructive",
				disabled: review.isPending || !approve && notes.trim().length === 0,
				onClick: () => review.mutate({
					requestId: request.id,
					approve,
					notes: notes.trim() || void 0
				}, {
					onSuccess: (result) => {
						if (result.status === "failed") toast.error("Approved, but the action could not be applied", { description: result.execution_error ?? void 0 });
						else toast.success(approve ? "Approved and applied" : "Request rejected");
						onClose();
					},
					onError: (error) => toast.error(friendlyAdminError(error))
				}),
				children: [review.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, approve ? "Approve and apply" : "Reject request"]
			})] })
		] })
	});
}
function RequestsTable({ status, emptyMessage }) {
	const { user } = useAuth();
	const requests = useActionRequests(status);
	const [reviewing, setReviewing] = (0, import_react.useState)(null);
	const rows = requests.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Action" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Details" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Raised by" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
				className: "text-right",
				children: "Decision"
			})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: requests.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			colSpan: 5,
			className: "text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			colSpan: 5,
			className: "text-center text-sm text-muted-foreground",
			children: emptyMessage
		}) }) : rows.map((request) => {
			const isOwn = request.requested_by === user?.id;
			const isPending = request.status === "pending";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: REQUEST_ACTION_LABEL[request.action]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "text-muted-foreground",
					children: [summarizeRequestPayload(request.action, request.payload), request.execution_error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-xs text-destructive",
						children: request.execution_error
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block",
						children: request.requester?.full_name ?? request.requester?.email ?? "—"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs",
						children: relativeAge(request.requested_at)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn(REQUEST_STATUS_TONE[request.status]),
					children: REQUEST_STATUS_LABEL[request.status]
				}), request.reviewer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-1 block text-xs text-muted-foreground",
					children: ["by ", request.reviewer.full_name ?? request.reviewer.email]
				}) : null] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: !isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: request.review_notes ? request.review_notes : "—"
					}) : isOwn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "You raised this request"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-destructive",
							onClick: () => setReviewing({
								request,
								approve: false
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Reject"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setReviewing({
								request,
								approve: true
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), "Approve"]
						})]
					})
				})
			] }, request.id);
		}) })] })
	}), reviewing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewDialog, {
		request: reviewing.request,
		approve: reviewing.approve,
		onClose: () => setReviewing(null)
	}) : null] });
}
function AdminApprovalsPage() {
	const { hasPermission, loading } = useAuth();
	const pending = useActionRequests("pending");
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Approvals",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.approvals")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Approvals",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include approval permissions."
			})] })]
		})
	});
	const pendingCount = (pending.data ?? []).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Approvals",
		description: "Refunds, payouts, admin access and account suspensions wait here for a second pair of eyes.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal mb-5 flex flex-wrap items-center gap-4 p-4 md:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary-deep",
					children: pendingCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold tabular-nums",
						children: pendingCount
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: pendingCount === 0 ? "Nothing is waiting on a decision." : pendingCount === 1 ? "request waiting on a decision" : "requests waiting on a decision"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "ml-auto max-w-sm text-xs text-muted-foreground",
					children: "You can't approve a request you raised yourself. Everything decided here is written to the audit log."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "pending",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "flex h-auto w-full flex-wrap justify-start gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "pending",
						className: "min-h-11",
						children: ["Pending", pendingCount > 0 ? ` (${pendingCount})` : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "all",
						className: "min-h-11",
						children: "All requests"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pending",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "panel-portal mt-4 p-4 md:p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestsTable, {
							status: "pending",
							emptyMessage: "Nothing is waiting for approval."
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "panel-portal mt-4 p-4 md:p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestsTable, {
							status: "all",
							emptyMessage: "No requests have been raised yet."
						})
					})
				})
			]
		})]
	});
}
//#endregion
export { AdminApprovalsPage as component };
