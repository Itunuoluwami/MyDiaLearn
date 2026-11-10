import { useMutation } from "@tanstack/react-query";

import { apiPost } from "@/lib/api/data-client";
import type { DisputeCategory } from "@/lib/domain-types";
export type { DisputeCategory } from "@/lib/domain-types";
import type { Database } from "@/integrations/supabase/types";

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
    mutationFn: async (input: {
      bookingId: string;
      category: DisputeCategory;
      description: string;
    }) => {
      const result = await apiPost<{ id: string }>(`/bookings/${input.bookingId}/disputes`, {
        category: input.category,
        description: input.description,
      });
      return result.id;
    },
  });
}
