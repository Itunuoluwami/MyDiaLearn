import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import type { PaymentsRow } from "@/lib/database-types";
import { apiPost } from "@/lib/api/data-client";

export type PaymentRow = PaymentsRow;

/** The API's payment shape. Money stays a string on the wire (NUMERIC). */
interface ApiPayment {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  platformFee: string;
  commissionAmount: string;
  tutorPayout: string;
  status: PaymentRow["status"];
  provider: string | null;
  providerReference: string | null;
  refundedAmount: string | null;
  paidAt: string | null;
  createdAt: string;
  /** Only when the provider needs the customer to finish on its own page. */
  checkoutUrl?: string;
}

/** Only the fields a caller reads; the API does not return the payer or rule ids. */
function toPaymentRow(p: ApiPayment): PaymentRow {
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
    created_at: p.createdAt,
  } as PaymentRow;
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
export function usePayForBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      try {
        const result = await apiPost<ApiPayment>("/payments", { bookingId });
        if (result.checkoutUrl) {
          // A redirect-based provider: the charge completes on its page, and
          // the server confirms it by webhook or verification afterwards —
          // never from this browser. The simulated provider never sets this.
          window.location.assign(result.checkoutUrl);
        }
        return toPaymentRow(result);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 409 &&
          /already been paid/i.test(error.message)
        ) {
          throw new Error("ALREADY_PAID");
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["parent-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}
