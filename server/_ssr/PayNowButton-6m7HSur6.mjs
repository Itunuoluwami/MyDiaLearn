import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as Button } from "./button-Be6IoNc1.mjs";
import { n as ApiError } from "./auth-DVJYIAuV.mjs";
import { Mt as CreditCard, it as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as apiPost } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as formatMoney } from "./parent-data-Dj0LJH5W.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-CAdlRg97.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PayNowButton-6m7HSur6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Only the fields a caller reads; the API does not return the payer or rule ids. */
function toPaymentRow(p) {
	return {
		id: p.id,
		booking_id: p.bookingId,
		amount: Number(p.amount),
		currency: p.currency,
		platform_fee: Number(p.platformFee),
		commission_amount: Number(p.commissionAmount),
		tutor_payout: Number(p.tutorPayout),
		status: p.status,
		provider: p.provider,
		provider_reference: p.providerReference,
		refunded_amount: p.refundedAmount === null ? null : Number(p.refundedAmount),
		paid_at: p.paidAt,
		created_at: p.createdAt
	};
}
/**
* Completes payment for a booking via pay_for_booking(). DiaLearn has no live
* payment gateway wired up in this codebase — this simulates an instant
* successful charge, which is the missing write path behind the
* payment-gated confirmation flow that already existed at the database
* layer (tutor_respond_booking() / confirm_booking_on_payment()): a lesson
* only becomes "confirmed" once both the tutor has accepted and a `payments`
* row exists with status "paid". Invalidates every portal's booking queries
* since a payment can flip a booking's status for the parent/student who
* paid and the tutor watching it at the same time.
*
* Under the API, a 409 "already paid" is rethrown as ALREADY_PAID so callers
* handle both paths with one check.
*/
function usePayForBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (bookingId) => {
			try {
				const result = await apiPost("/payments", { bookingId });
				if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
				return toPaymentRow(result);
			} catch (error) {
				if (error instanceof ApiError && error.status === 409 && /already been paid/i.test(error.message)) throw new Error("ALREADY_PAID");
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
			queryClient.invalidateQueries({ queryKey: ["parent-payments"] });
			queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
/**
* "Pay now" — completes payment for a booking so it can move to confirmed.
* DiaLearn doesn't have a live payment gateway wired into this codebase, so
* this is explicit about simulating an instant successful charge rather than
* showing a fake card form; it still records a real payments row and drives
* the real (already-built) payment-gated confirmation flow.
*/
function PayNowButton({ bookingId, amount, currency, size = "sm" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const pay = usePayForBooking();
	async function handleConfirm() {
		try {
			await pay.mutateAsync(bookingId);
			toast.success("Payment complete — this lesson is confirmed once your tutor accepts.");
			setOpen(false);
		} catch (error) {
			if ((error instanceof Error ? error.message : "").includes("ALREADY_PAID")) {
				toast.info("This lesson is already paid for.");
				setOpen(false);
				return;
			}
			if (error instanceof ApiError && error.status < 500) {
				toast.error(error.message);
				return;
			}
			toast.error("We couldn't process that payment. Please try again.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "cta",
			size,
			className: size === "sm" ? "min-h-11 sm:min-h-9" : "min-h-12 w-full",
			onClick: () => setOpen(true),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "size-4" }),
				"Pay ",
				formatMoney(amount, currency)
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Complete payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [formatMoney(amount, currency), " for this lesson. DiaLearn doesn't have a live payment gateway connected in this build, so confirming here simulates a successful charge and immediately marks the lesson as paid — it moves to confirmed once your tutor also accepts."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
			disabled: pay.isPending,
			onClick: () => void handleConfirm(),
			children: [pay.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Confirm payment"]
		})] })] })]
	});
}
//#endregion
export { PayNowButton as t };
