import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { Bt as CircleX, E as ShieldAlert, it as LoaderCircle, k as Search } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-BywuKtge.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-94z5oXH8.mjs";
import { t as Label } from "./label-CpwYyfSr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BCADeg5Y.mjs";
import { t as AdminShell } from "./AdminShell-B9F1FU0d.mjs";
import { o as friendlyAdminError } from "./admin-governance-AZIEy_jw.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CjMKxxgr.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-Drj9JKn2.mjs";
import { a as useAdminCancelBooking, f as useAdminUpdateBookingStatus, i as useAdminBookings } from "./admin-data-uZ6jnAG3.mjs";
import { t as Textarea } from "./textarea-3GkRvoZq.mjs";
import { s as formatMoney, t as BOOKING_STATUS_LABEL } from "./parent-data-Dj0LJH5W.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.bookings-Bqdfs1xa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_FILTERS = [
	"all",
	"pending",
	"confirmed",
	"in_progress",
	"completed",
	"cancelled",
	"rejected",
	"no_show"
];
/** Overrides that don't touch money — cancellation is a separate flow so the
* refund calculation can never be skipped by accident. */
var OVERRIDE_OPTIONS = [
	"pending",
	"confirmed",
	"in_progress",
	"completed",
	"no_show",
	"rejected"
];
function CancelDialog({ booking, onClose }) {
	const [reason, setReason] = (0, import_react.useState)("");
	const [refundPct, setRefundPct] = (0, import_react.useState)("");
	const cancel = useAdminCancelBooking();
	const studentName = `${booking.students?.first_name ?? ""} ${booking.students?.last_name ?? ""}`.trim() || "Student";
	const tutorName = booking.tutors?.profiles?.full_name ?? "Tutor";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Cancel this booking?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				studentName,
				" with ",
				tutorName,
				" · ",
				formatMoney(booking.total_amount, booking.currency),
				". Leave the refund % blank to use the booking's cancellation policy."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cancel-reason",
						children: "Reason"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "cancel-reason",
						rows: 3,
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "Why is this booking being cancelled?"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cancel-refund",
						children: "Refund % (optional override)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cancel-refund",
						type: "number",
						min: 0,
						max: 100,
						placeholder: "Use policy default",
						value: refundPct,
						onChange: (e) => setRefundPct(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Back"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "destructive",
				disabled: cancel.isPending || !reason.trim(),
				onClick: () => cancel.mutate({
					bookingId: booking.id,
					reason: reason.trim(),
					refundPercentage: refundPct ? Number(refundPct) : null
				}, {
					onSuccess: () => {
						toast.success("Cancellation sent for approval", { description: "Another admin has to approve it before the booking is cancelled and refunded." });
						onClose();
					},
					onError: (error) => toast.error(friendlyAdminError(error))
				}),
				children: [cancel.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4" }), "Send for approval"]
			})] })
		] })
	});
}
function AdminBookingsPage() {
	const { hasPermission, loading } = useAuth();
	const [search, setSearch] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [cancelling, setCancelling] = (0, import_react.useState)(null);
	const bookings = useAdminBookings({
		search,
		status
	});
	const updateStatus = useAdminUpdateBookingStatus();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Bookings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!hasPermission("admin.bookings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Bookings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-warm flex items-start gap-3 p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold",
				children: "Admin access required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your account type doesn't include booking management permissions."
			})] })]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Bookings",
		description: "Every lesson booked across the platform.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-portal p-4 md:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by student or tutor name",
						className: "pl-9",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: status,
					onValueChange: (value) => setStatus(value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "sm:w-52",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_FILTERS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: option,
						children: option === "all" ? "All statuses" : BOOKING_STATUS_LABEL[option]
					}, option)) })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "When" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Student" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tutor" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Subject" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Amount" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: bookings.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "text-center text-sm text-muted-foreground",
					children: "Loading…"
				}) }) : (bookings.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "text-center text-sm text-muted-foreground",
					children: "No bookings match your filters."
				}) }) : (bookings.data ?? []).map((booking) => {
					const studentName = `${booking.students?.first_name ?? ""} ${booking.students?.last_name ?? ""}`.trim() || "—";
					const tutorName = booking.tutors?.profiles?.full_name ?? "—";
					const cancellable = ![
						"cancelled",
						"completed",
						"rejected"
					].includes(booking.status);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-muted-foreground",
							children: new Date(booking.starts_at).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: studentName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: tutorName }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-muted-foreground",
							children: booking.subjects?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: formatMoney(booking.total_amount, booking.currency) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: booking.status,
							onValueChange: (value) => updateStatus.mutate({
								id: booking.id,
								status: value
							}, { onError: (error) => toast.error(error.message) }),
							disabled: !cancellable && booking.status !== "no_show",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: BOOKING_STATUS_LABEL[booking.status]
								}) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: OVERRIDE_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: option,
								children: BOOKING_STATUS_LABEL[option]
							}, option)) })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "text-destructive",
								disabled: !cancellable,
								onClick: () => setCancelling(booking),
								children: "Cancel"
							})
						})
					] }, booking.id);
				}) })] })
			})]
		}), cancelling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CancelDialog, {
			booking: cancelling,
			onClose: () => setCancelling(null)
		}) : null]
	});
}
//#endregion
export { AdminBookingsPage as component };
