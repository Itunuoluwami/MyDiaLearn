import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { i as cn, n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { E as ShieldAlert, it as LoaderCircle, m as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BNMmLmsd.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { _ as useIssueRefund, l as useAdminRefunds, s as useAdminPayments } from "./admin-data-uZ6jnAG3.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { n as PAYMENT_STATUS_LABEL, s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.payments-DVk1qXFg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_FILTERS = [
	"all",
	"flagged",
	"pending",
	"processing",
	"paid",
	"failed",
	"refunded",
	"partially_refunded"
];
function paymentParty(payment) {
	const student = payment.bookings?.students;
	const tutor = payment.bookings?.tutors?.profiles?.full_name;
	return {
		studentName: `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim() || "—",
		tutorName: tutor ?? "—"
	};
}
function RefundDialog({ payment, onClose }) {
	const [amount, setAmount] = (0, import_react.useState)(String(payment.amount - payment.refunded_amount));
	const [reason, setReason] = (0, import_react.useState)("");
	const issueRefund = useIssueRefund();
	const { studentName } = paymentParty(payment);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Issue a refund" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				studentName,
				" · original amount ",
				formatMoney(payment.amount, payment.currency),
				payment.refunded_amount > 0 ? ` · already refunded ${formatMoney(payment.refunded_amount, payment.currency)}` : ""
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "refund-amount",
						children: [
							"Refund amount (",
							payment.currency,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "refund-amount",
						type: "number",
						min: 0,
						max: payment.amount,
						step: "0.01",
						value: amount,
						onChange: (e) => setAmount(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "refund-reason",
						children: "Reason"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "refund-reason",
						rows: 3,
						value: reason,
						onChange: (e) => setReason(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: issueRefund.isPending || !amount || Number(amount) <= 0,
				onClick: () => issueRefund.mutate({
					paymentId: payment.id,
					amount: Number(amount),
					...reason.trim() ? { reason: reason.trim() } : {}
				}, {
					onSuccess: () => {
						toast.success("Refund issued");
						onClose();
					},
					onError: (error) => toast.error(error.message)
				}),
				children: [issueRefund.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Issue refund"]
			})] })
		] })
	});
}
function PaymentsTable({ payments, isLoading, onRefund }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Student" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tutor" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Amount" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Refunded" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
				className: "text-right",
				children: "Actions"
			})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			colSpan: 7,
			className: "text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) }) : payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			colSpan: 7,
			className: "text-center text-sm text-muted-foreground",
			children: "Nothing here."
		}) }) : payments.map((payment) => {
			const { studentName, tutorName } = paymentParty(payment);
			const refundable = payment.status === "paid" || payment.status === "partially_refunded";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "whitespace-nowrap text-muted-foreground",
					children: new Date(payment.created_at).toLocaleDateString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: studentName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: tutorName }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatMoney(payment.amount, payment.currency) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-muted-foreground",
					children: payment.refunded_amount > 0 ? formatMoney(payment.refunded_amount, payment.currency) : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn(payment.status === "failed" ? "bg-destructive/12 text-destructive" : void 0, payment.status === "paid" ? "bg-success/12 text-success" : void 0),
					variant: payment.status === "failed" || payment.status === "paid" ? "default" : "outline",
					children: PAYMENT_STATUS_LABEL[payment.status]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						disabled: !refundable,
						onClick: () => onRefund(payment),
						children: "Refund"
					})
				})
			] }, payment.id);
		}) })] })
	});
}
function AdminPaymentsPage() {
	const { hasPermission, loading } = useAuth();
	const [status, setStatus] = (0, import_react.useState)("all");
	const [refunding, setRefunding] = (0, import_react.useState)(null);
	const payments = useAdminPayments({ status });
	const refunds = useAdminRefunds();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Payments",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.payments")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Payments",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include payment monitoring permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Payments",
		description: "Transaction history, flagged payments and refunds.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "transactions",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "transactions",
					children: "Transactions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "refunds",
					children: "Refunds"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "transactions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-portal mt-4 p-4 md:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: status,
								onValueChange: (value) => setStatus(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "sm:w-52",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_FILTERS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: option,
									children: option === "all" ? "All statuses" : option === "flagged" ? "Flagged" : PAYMENT_STATUS_LABEL[option]
								}, option)) })]
							}), status === "flagged" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), "Failed payments, plus pending/processing ones stuck over 24 hours."]
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsTable, {
								payments: payments.data ?? [],
								isLoading: payments.isLoading,
								onRefund: setRefunding
							})
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "refunds",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-portal mt-4 p-4 md:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Every payment with a recorded refund, newest first."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsTable, {
								payments: refunds.data ?? [],
								isLoading: refunds.isLoading,
								onRefund: setRefunding
							})
						})]
					})
				})
			]
		}), refunding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefundDialog, {
			payment: refunding,
			onClose: () => setRefunding(null)
		}) : null]
	});
}
//#endregion
export { AdminPaymentsPage as component };
