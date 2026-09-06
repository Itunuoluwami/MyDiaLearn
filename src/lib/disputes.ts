import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DisputeCategory = Database["public"]["Enums"]["dispute_category"];

export const DISPUTE_CATEGORY_LABEL: Record<DisputeCategory, string> = {
  payment: "Payment issue",
  conduct: "Conduct concern",
  quality: "Lesson quality",
  scheduling: "Scheduling problem",
  other: "Something else",
};

export const DISPUTE_CATEGORY_OPTIONS: DisputeCategory[] = [
  "payment",
  "conduct",
  "quality",
  "scheduling",
  "other",
];

/**
 * Raises a dispute against a booking via the raise_dispute() RPC (added in
 * the Admin Portal Phase 4A disputes migration). The RPC itself validates
 * the caller is actually a party to the booking — booked_by, the student,
 * the student's parent, or the tutor — so this hook can be used as-is from
 * the Parent, Student and Tutor portals without any extra client-side
 * authorization logic.
 */
export function useRaiseDispute() {
  return useMutation({
    mutationFn: async (input: { bookingId: string; category: DisputeCategory; description: string }) => {
      const { data, error } = await supabase.rpc("raise_dispute", {
        p_booking_id: input.bookingId,
        p_category: input.category,
        p_description: input.description,
      });
      if (error) throw error;
      return data;
    },
  });
}
