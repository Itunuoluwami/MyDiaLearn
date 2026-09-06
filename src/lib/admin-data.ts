import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_dashboard_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export type AdminSummary = NonNullable<ReturnType<typeof useAdminSummary>["data"]>;

/* ------------------------------------------------------------------ */
/* User management (all roles)                                         */
/* ------------------------------------------------------------------ */

export function useAdminUsers(params?: { search?: string; role?: AppRole | "all"; from?: string; to?: string }) {
  const search = params?.search?.trim() ?? "";
  const role = params?.role ?? "all";

  return useQuery({
    queryKey: ["admin-users", search, role, params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, primary_role, is_active, onboarding_completed, created_at, user_roles(role)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (role !== "all") {
        query = query.eq("primary_role", role);
      }
      if (params?.from) query = query.gte("created_at", params.from);
      if (params?.to) query = query.lte("created_at", params.to);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type AdminUser = NonNullable<ReturnType<typeof useAdminUsers>["data"]>[number];

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      const { data: existing, error: readError } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", userId);
      if (readError) throw readError;

      const currentRoles = new Set((existing ?? []).map((row) => row.role));
      const nextRoles = new Set(roles);

      const toAdd = [...nextRoles].filter((role) => !currentRoles.has(role));
      const toRemoveIds = (existing ?? []).filter((row) => !nextRoles.has(row.role)).map((row) => row.id);

      if (toAdd.length > 0) {
        const { error } = await supabase
          .from("user_roles")
          .insert(toAdd.map((role) => ({ user_id: userId, role })));
        if (error) throw error;
      }
      if (toRemoveIds.length > 0) {
        const { error } = await supabase.from("user_roles").delete().in("id", toRemoveIds);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Tutor verification queue                                            */
/* ------------------------------------------------------------------ */

export function useVerificationQueue(status?: VerificationStatus | "all") {
  const filter = status ?? "pending";
  return useQuery({
    queryKey: ["admin-verification-queue", filter],
    queryFn: async () => {
      let query = supabase
        .from("tutors")
        .select(
          "id, profile_id, headline, verification_status, is_listed, submitted_at, years_experience, hourly_rate, currency, profiles(full_name, email, avatar_url)",
        )
        .order("submitted_at", { ascending: true, nullsFirst: false });

      if (filter !== "all") {
        query = query.eq("verification_status", filter);
      } else {
        query = query.neq("verification_status", "unverified");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type VerificationQueueItem = NonNullable<ReturnType<typeof useVerificationQueue>["data"]>[number];

export function useTutorVerificationDetail(tutorId: string | null) {
  return useQuery({
    queryKey: ["admin-verification-detail", tutorId],
    enabled: Boolean(tutorId),
    queryFn: async () => {
      const [steps, progress, documents] = await Promise.all([
        supabase
          .from("verification_steps")
          .select("id, code, name, description, is_required, sort_order")
          .eq("applies_to", "tutor")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("tutor_verification_progress")
          .select("id, step_id, status, reviewer_notes, reviewed_at")
          .eq("tutor_id", tutorId!),
        supabase
          .from("tutor_documents")
          .select("id, step_id, label, storage_path, mime_type, size_bytes, status, reviewer_notes, created_at")
          .eq("tutor_id", tutorId!)
          .order("created_at", { ascending: false }),
      ]);
      if (steps.error) throw steps.error;
      if (progress.error) throw progress.error;
      if (documents.error) throw documents.error;
      return {
        steps: steps.data ?? [],
        progress: progress.data ?? [],
        documents: documents.data ?? [],
      };
    },
  });
}

export function useReviewVerificationStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tutorId: string;
      stepId: string;
      progressId?: string | null;
      status: VerificationStatus;
      reviewerNotes?: string | null;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (input.progressId) {
        const { error } = await supabase
          .from("tutor_verification_progress")
          .update({
            status: input.status,
            reviewer_notes: input.reviewerNotes ?? null,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user?.id ?? null,
          })
          .eq("id", input.progressId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tutor_verification_progress").insert({
          tutor_id: input.tutorId,
          step_id: input.stepId,
          status: input.status,
          reviewer_notes: input.reviewerNotes ?? null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
    },
  });
}

export function useReviewTutorDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { documentId: string; status: VerificationStatus; reviewerNotes?: string | null }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("tutor_documents")
        .update({
          status: input.status,
          reviewer_notes: input.reviewerNotes ?? null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq("id", input.documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
    },
  });
}

export function useDocumentUrl() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data, error } = await supabase.storage
        .from("tutor-documents")
        .createSignedUrl(storagePath, 60 * 5);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

/** Approve or reject a tutor's overall verification. Admin writes bypass the
 * enforce_tutor_verification_rules() trigger's auto-management (it only
 * forces is_listed *off* on any non-verified status), so approving here
 * explicitly turns is_listed back on to actually make the tutor bookable. */
export function useApproveTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tutorId: string) => {
      const { error } = await supabase
        .from("tutors")
        .update({ verification_status: "verified", is_listed: true })
        .eq("id", tutorId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/** Tutors cannot set their own hourly_rate (a BEFORE UPDATE trigger on
 * public.tutors rejects the change from anyone who isn't is_admin() —
 * defense in depth on top of the field being read-only in the tutor-facing
 * UI). This is the one write path: admin sets it, here or in Users. */
export function useSetTutorHourlyRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorId, hourlyRate }: { tutorId: string; hourlyRate: number }) => {
      const { error } = await supabase.from("tutors").update({ hourly_rate: hourlyRate }).eq("id", tutorId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
    },
  });
}

export function useRejectTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tutorId }: { tutorId: string; reason?: string }) => {
      const { error } = await supabase
        .from("tutors")
        .update({ verification_status: "rejected", is_listed: false })
        .eq("id", tutorId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Bookings (Phase 2)                                                    */
/* ------------------------------------------------------------------ */

export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type PayoutStatus = Database["public"]["Enums"]["payout_status"];

const ADMIN_BOOKING_SELECT =
  "id, student_id, tutor_id, booked_by, subject_id, starts_at, ends_at, duration_minutes, status, currency, total_amount, cancellation_policy_id, cancelled_at, cancellation_reason, created_at, students(first_name, last_name), tutors(id, profiles(full_name)), subjects(name)";

export function useAdminBookings(params?: {
  search?: string;
  status?: BookingStatus | "all";
  from?: string;
  to?: string;
}) {
  const search = params?.search?.trim() ?? "";
  const status = params?.status ?? "all";

  return useQuery({
    queryKey: ["admin-bookings", search, status, params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(ADMIN_BOOKING_SELECT)
        .order("starts_at", { ascending: false })
        .limit(200);
      if (status !== "all") query = query.eq("status", status);
      if (params?.from) query = query.gte("starts_at", params.from);
      if (params?.to) query = query.lte("starts_at", params.to);

      const { data, error } = await query;
      if (error) throw error;
      let rows = data ?? [];

      if (search) {
        const needle = search.toLowerCase();
        rows = rows.filter((row) => {
          const studentName = `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.toLowerCase();
          const tutorName = (row.tutors?.profiles?.full_name ?? "").toLowerCase();
          return studentName.includes(needle) || tutorName.includes(needle);
        });
      }
      return rows;
    },
  });
}

export type AdminBooking = NonNullable<ReturnType<typeof useAdminBookings>["data"]>[number];

/** Non-financial status overrides only — cancellation always goes through
 * useAdminCancelBooking() so the refund calculation isn't bypassed. */
export function useAdminUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/** Cancels a booking and applies its cancellation policy's refund % (or an
 * explicit override) to any paid payment, via admin_cancel_booking(). This
 * is the first place in the app that actually executes a refund — nothing
 * else computes one from cancellation_policies today. */
export function useAdminCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { bookingId: string; reason: string; refundPercentage?: number | null }) => {
      const { data, error } = await supabase.rpc("admin_cancel_booking", {
        p_booking_id: input.bookingId,
        p_reason: input.reason,
        p_refund_percentage: input.refundPercentage ?? null,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payments & refunds (Phase 2)                                         */
/* ------------------------------------------------------------------ */

const ADMIN_PAYMENT_SELECT =
  "id, booking_id, tutor_id, payer_id, amount, currency, status, provider, provider_reference, paid_at, refunded_amount, created_at, bookings(starts_at, students(first_name, last_name), tutors(profiles(full_name)))";

export function useAdminPayments(params?: { status?: PaymentStatus | "all" | "flagged"; from?: string; to?: string }) {
  const status = params?.status ?? "all";

  return useQuery({
    queryKey: ["admin-payments", status, params?.from ?? null, params?.to ?? null],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select(ADMIN_PAYMENT_SELECT)
        .order("created_at", { ascending: false })
        .limit(200);
      if (status !== "all" && status !== "flagged") query = query.eq("status", status);
      if (params?.from) query = query.gte("created_at", params.from);
      if (params?.to) query = query.lte("created_at", params.to);

      const { data, error } = await query;
      if (error) throw error;
      let rows = data ?? [];

      // "Flagged" isn't a stored column — nothing in this schema tracks it —
      // so it's a filter: failed payments, plus pending/processing ones
      // stuck for more than 24 hours.
      if (status === "flagged") {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        rows = rows.filter(
          (row) =>
            row.status === "failed" ||
            (["pending", "processing"].includes(row.status) && new Date(row.created_at).getTime() < cutoff),
        );
      }
      return rows;
    },
  });
}

export type AdminPayment = NonNullable<ReturnType<typeof useAdminPayments>["data"]>[number];

export function useAdminRefunds() {
  return useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(ADMIN_PAYMENT_SELECT)
        .gt("refunded_amount", 0)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Ad-hoc refund on a payment not tied to a booking cancellation (goodwill,
 * billing correction, etc). Single-table update — admin_cancel_booking()
 * handles the booking+payment combo, this handles payment-only. */
export function useIssueRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, amount }: { paymentId: string; amount: number; reason?: string }) => {
      const { data: existing, error: readError } = await supabase
        .from("payments")
        .select("amount")
        .eq("id", paymentId)
        .maybeSingle();
      if (readError) throw readError;
      if (!existing) throw new Error("Payment not found");

      const refundAmount = Math.min(Math.max(amount, 0), existing.amount);
      const { error } = await supabase
        .from("payments")
        .update({
          refunded_amount: refundAmount,
          status: refundAmount >= existing.amount ? "refunded" : "partially_refunded",
        })
        .eq("id", paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payouts (Phase 2)                                                     */
/* ------------------------------------------------------------------ */

const ADMIN_PAYOUT_SELECT =
  "id, tutor_id, amount, currency, status, reference, notes, requested_at, settled_at, tutors(profiles(full_name))";

export function useAdminPayouts(params?: { status?: PayoutStatus | "all" }) {
  const status = params?.status ?? "all";

  return useQuery({
    queryKey: ["admin-payouts", status],
    queryFn: async () => {
      let query = supabase
        .from("payouts")
        .select(ADMIN_PAYOUT_SELECT)
        .order("requested_at", { ascending: false })
        .limit(200);
      if (status !== "all") query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type AdminPayout = NonNullable<ReturnType<typeof useAdminPayouts>["data"]>[number];

export function useSettlePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payouts")
        .update({ status: "paid", settled_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });
}

export function useRejectPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payouts").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Disputes (Phase 4A)                                                   */
/* ------------------------------------------------------------------ */

export type DisputeStatus = Database["public"]["Enums"]["dispute_status"];
export type DisputeCategory = Database["public"]["Enums"]["dispute_category"];

const ADMIN_DISPUTE_SELECT =
  "id, booking_id, category, status, description, resolution_notes, resolved_at, created_at, raised_by_profile:profiles!raised_by(full_name), against_profile:profiles!against_profile_id(full_name), bookings(starts_at, subjects(name))";

export function useAdminDisputes(status?: DisputeStatus | "all") {
  const filter = status ?? "open";
  return useQuery({
    queryKey: ["admin-disputes", filter],
    queryFn: async () => {
      let query = supabase
        .from("disputes")
        .select(ADMIN_DISPUTE_SELECT)
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter !== "all") query = query.eq("status", filter);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type AdminDispute = NonNullable<ReturnType<typeof useAdminDisputes>["data"]>[number];

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { disputeId: string; status: DisputeStatus; notes?: string }) => {
      const { error } = await supabase.rpc("admin_resolve_dispute", {
        p_dispute_id: input.disputeId,
        p_status: input.status,
        p_resolution_notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Content moderation (Phase 4B)                                         */
/* ------------------------------------------------------------------ */

export function useModerationReviews(params?: { onlyPublished?: boolean }) {
  return useQuery({
    queryKey: ["admin-moderation-reviews", params?.onlyPublished ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("ratings")
        .select("id, score, comment, is_published, created_at, tutor_id, tutors(profiles(full_name)), profiles!rater_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (params?.onlyPublished !== undefined) query = query.eq("is_published", params.onlyPublished);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type ModerationReview = NonNullable<ReturnType<typeof useModerationReviews>["data"]>[number];

export function useSetReviewPublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase.from("ratings").update({ is_published: isPublished }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-moderation-reviews"] }),
  });
}

export function useModerationMessages(search?: string) {
  const needle = search?.trim() ?? "";
  return useQuery({
    queryKey: ["admin-moderation-messages", needle],
    enabled: needle.length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, body, sender_id, is_hidden, created_at, conversation_id, profiles!sender_id(full_name)")
        .ilike("body", `%${needle}%`)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type ModerationMessage = NonNullable<ReturnType<typeof useModerationMessages>["data"]>[number];

export function useSetMessageHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isHidden, reason }: { id: string; isHidden: boolean; reason?: string }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_hidden: isHidden, hidden_reason: isHidden ? reason ?? null : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-moderation-messages"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Reports (Phase 3)                                                     */
/* ------------------------------------------------------------------ */

export function useAdminReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["admin-report-summary", from, to],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_report_summary", { p_from: from, p_to: to });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export type AdminReportSummary = NonNullable<ReturnType<typeof useAdminReportSummary>["data"]>;

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                 */
/* ------------------------------------------------------------------ */

export const ROLE_LABEL: Record<AppRole, string> = {
  student: "Student",
  parent: "Parent",
  tutor: "Tutor",
  agency: "Agency",
  admin: "Admin",
};
