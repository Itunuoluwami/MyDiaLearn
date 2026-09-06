import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

/**
 * Completes payment for a booking via the pay_for_booking() RPC. DiaLearn
 * has no live payment gateway wired up in this codebase — this simulates an
 * instant successful charge, which is the missing write path behind the
 * payment-gated confirmation flow that already existed at the database
 * layer (tutor_respond_booking() / confirm_booking_on_payment()): a lesson
 * only becomes "confirmed" once both the tutor has accepted and a `payments`
 * row exists with status "paid". Invalidates every portal's booking queries
 * since a payment can flip a booking's status for the parent/student who
 * paid and the tutor watching it at the same time.
 */
export function usePayForBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc("pay_for_booking", { p_booking_id: bookingId });
      if (error) throw error;
      return data as PaymentRow;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}
