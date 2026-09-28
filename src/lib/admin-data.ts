import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { apiGet, apiPatch, apiPost, useApiData } from "@/lib/api/data-client";
import { authClient } from "@/lib/auth";
import { governanceRpc, governanceTable } from "@/integrations/supabase/governance-types";
import type { Database } from "@/integrations/supabase/types";
import type { AppRole as AuthAppRole } from "@/hooks/use-auth";

/** Re-exported so `super_admin` is included; see the note in use-auth.tsx. */
export type AppRole = AuthAppRole;
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** PUT with the session token; data-client has no apiPut. */
async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const { data } = await authClient.getSession();
  const accessToken = data.session?.access_token;
  return apiRequest<T>(path, { method: "PUT", body, ...(accessToken ? { accessToken } : {}) });
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

/** admin_dashboard_summary(), as the live function returns it. */
export interface AdminSummaryRow {
  new_students: number;
  new_parents: number;
  new_tutors: number;
  tutor_activation_rate: number | null;
  booking_demand: number;
  gmv: number;
  gmv_currency: string;
  commission_revenue: number;
  avg_transaction_value: number | null;
  classes_per_student: number | null;
  repeat_booking_rate: number | null;
  mau: number;
  avg_tutor_rating: number | null;
  cancellation_rate: number | null;
  no_show_rate: number | null;
  dispute_rate: number | null;
}

/** Function rows arrive with NUMERIC/bigint columns possibly stringified. */
function numericRow<T>(row: Record<string, unknown>, textKeys: readonly string[] = []): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] =
      value === null || value === undefined || textKeys.includes(key) ? value : Number(value);
  }
  return out as T;
}

export function useAdminSummary() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-summary"],
    queryFn: async (): Promise<AdminSummaryRow | null> => {
      if (viaApi) {
        const row = await apiGet<Record<string, unknown> | null>("/admin/dashboard");
        return row ? numericRow<AdminSummaryRow>(row, ["gmv_currency"]) : null;
      }
      const rows = await governanceRpc<AdminSummaryRow[] | null>("admin_dashboard_summary");
      return rows?.[0] ?? null;
    },
  });
}

export type AdminSummary = AdminSummaryRow;

/* ------------------------------------------------------------------ */
/* User management (all roles)                                         */
/* ------------------------------------------------------------------ */

export interface AdminUserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  primary_role: AppRole;
  is_active: boolean;
  onboarding_completed: boolean;
  created_at: string;
  user_roles: { role: AppRole }[];
}

interface ApiAdminUser {
  id: string;
  fullName: string | null;
  email: string | null;
  primaryRole: AppRole;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  roles: AppRole[];
}

export function useAdminUsers(params?: {
  search?: string;
  role?: AppRole | "all";
  from?: string;
  to?: string;
}) {
  const search = params?.search?.trim() ?? "";
  const role = params?.role ?? "all";
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["admin-users", search, role, params?.from ?? null, params?.to ?? null],
    queryFn: async (): Promise<AdminUserRow[]> => {
      if (viaApi) {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (role !== "all") query.set("role", role);
        if (params?.from) query.set("from", params.from);
        if (params?.to) query.set("to", params.to);
        const rows = await apiGet<ApiAdminUser[]>(`/admin/users?${query.toString()}`);
        return rows.map((u) => ({
          id: u.id,
          full_name: u.fullName,
          email: u.email,
          primary_role: u.primaryRole,
          is_active: u.isActive,
          onboarding_completed: u.onboardingCompleted,
          created_at: u.createdAt,
          user_roles: u.roles.map((r) => ({ role: r })),
        }));
      }
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, email, primary_role, is_active, onboarding_completed, created_at, user_roles(role)",
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (role !== "all") {
        // types.ts predates super_admin, so the generated column type is
        // narrower than AppRole. The value is valid at the database.
        query = query.eq("primary_role", role as Database["public"]["Enums"]["app_role"]);
      }
      if (params?.from) query = query.gte("created_at", params.from);
      if (params?.to) query = query.lte("created_at", params.to);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AdminUserRow[];
    },
  });
}

export type AdminUser = AdminUserRow;

/** Suspending or restoring an account changes who can reach the platform, so it
 * goes through the approval queue rather than committing on the first click.
 * Resolves to a request id — nothing has happened yet when this returns. */
export function useSuspendUser() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>(`/admin/users/${id}/suspend`, {
          isActive,
        });
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: "profile.suspend",
        p_payload: { profile_id: id, is_active: isActive },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
    },
  });
}

/** Ordinary roles are set directly through admin_set_user_roles(); anything
 * touching admin or super_admin is refused there and must go through the
 * approval queue instead (see useRequestElevatedRole in admin-governance.ts).
 *
 * Note this hook could never have worked before: user_roles was only ever
 * granted SELECT to authenticated, so the direct insert/delete it used to do
 * failed with 42501 every time. */
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      if (viaApi) {
        await apiPost(`/users/${userId}/roles`, { roles });
        return;
      }
      await governanceRpc<void>("admin_set_user_roles", {
        p_user_id: userId,
        p_roles: roles,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-admin-accounts"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Tutor verification queue                                            */
/* ------------------------------------------------------------------ */

type TutorRow = Database["public"]["Tables"]["tutors"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type VerificationQueueItem = Pick<
  TutorRow,
  | "id"
  | "profile_id"
  | "headline"
  | "verification_status"
  | "is_listed"
  | "submitted_at"
  | "years_experience"
  | "hourly_rate"
  | "currency"
> & { profiles: Pick<ProfileRow, "full_name" | "email" | "avatar_url"> | null };

interface ApiQueueItem {
  id: string;
  profileId: string;
  headline: string | null;
  verificationStatus: VerificationStatus;
  isListed: boolean;
  submittedAt: string | null;
  yearsExperience: number | null;
  hourlyRate: string | null;
  currency: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export function useVerificationQueue(status?: VerificationStatus | "all") {
  const filter = status ?? "pending";
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-verification-queue", filter],
    queryFn: async (): Promise<VerificationQueueItem[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiQueueItem[]>(`/admin/verification?status=${filter}`);
        return rows.map((t) => ({
          id: t.id,
          profile_id: t.profileId,
          headline: t.headline,
          verification_status: t.verificationStatus,
          is_listed: t.isListed,
          submitted_at: t.submittedAt,
          years_experience: t.yearsExperience,
          hourly_rate: t.hourlyRate === null ? null : Number(t.hourlyRate),
          currency: t.currency,
          profiles: { full_name: t.fullName, email: t.email, avatar_url: t.avatarUrl },
        })) as VerificationQueueItem[];
      }
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
      return (data ?? []) as VerificationQueueItem[];
    },
  });
}

type StepRow = Pick<
  Database["public"]["Tables"]["verification_steps"]["Row"],
  "id" | "code" | "name" | "description" | "is_required" | "sort_order"
>;
type ProgressRow = Pick<
  Database["public"]["Tables"]["tutor_verification_progress"]["Row"],
  "id" | "step_id" | "status" | "reviewer_notes" | "reviewed_at"
>;
type DocumentRow = Pick<
  Database["public"]["Tables"]["tutor_documents"]["Row"],
  | "id"
  | "step_id"
  | "label"
  | "storage_path"
  | "mime_type"
  | "size_bytes"
  | "status"
  | "reviewer_notes"
  | "created_at"
>;

export interface TutorVerificationDetail {
  steps: StepRow[];
  progress: ProgressRow[];
  documents: DocumentRow[];
}

export function useTutorVerificationDetail(tutorId: string | null) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-verification-detail", tutorId],
    enabled: Boolean(tutorId),
    queryFn: async (): Promise<TutorVerificationDetail> => {
      if (viaApi) {
        const detail = await apiGet<{
          steps: StepRow[];
          progress: ProgressRow[];
          documents: (Omit<DocumentRow, "storage_path"> & { has_file: boolean })[];
        }>(`/admin/verification/${tutorId}`);
        return {
          steps: detail.steps.map((step) => ({ ...step, sort_order: Number(step.sort_order) })),
          progress: detail.progress,
          // Storage keys are not exposed, and files cannot be opened until a
          // storage provider is configured.
          documents: detail.documents.map(({ has_file: _hasFile, ...doc }) => ({
            ...doc,
            size_bytes: doc.size_bytes === null ? null : Number(doc.size_bytes),
            storage_path: "",
          })),
        };
      }
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
          .select(
            "id, step_id, label, storage_path, mime_type, size_bytes, status, reviewer_notes, created_at",
          )
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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      tutorId: string;
      stepId: string;
      progressId?: string | null;
      status: VerificationStatus;
      reviewerNotes?: string | null;
    }) => {
      if (viaApi) {
        // One progress row per tutor and step; the server inserts or updates.
        await apiPut(`/admin/verification/${input.tutorId}/steps/${input.stepId}`, {
          status: input.status,
          ...(input.reviewerNotes ? { reviewerNotes: input.reviewerNotes } : {}),
        });
        return;
      }
      const {
        data: { user },
      } = await authClient.getUser();

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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      documentId: string;
      status: VerificationStatus;
      reviewerNotes?: string | null;
    }) => {
      if (viaApi) {
        await apiPatch(`/admin/verification/documents/${input.documentId}`, {
          status: input.status,
          ...(input.reviewerNotes ? { reviewerNotes: input.reviewerNotes } : {}),
        });
        return;
      }
      const {
        data: { user },
      } = await authClient.getUser();
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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (storagePath: string) => {
      if (viaApi || !storagePath) {
        throw new Error(
          "Viewing uploaded documents isn't available on this server yet (no file storage is configured).",
        );
      }
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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (tutorId: string) => {
      if (viaApi) {
        await apiPost(`/admin/verification/${tutorId}/approve`, {});
        return;
      }
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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ tutorId, hourlyRate }: { tutorId: string; hourlyRate: number }) => {
      if (viaApi) {
        await apiPatch(`/admin/tutors/${tutorId}/hourly-rate`, { hourlyRate });
        return;
      }
      const { error } = await supabase
        .from("tutors")
        .update({ hourly_rate: hourlyRate })
        .eq("id", tutorId);
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
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ tutorId, reason }: { tutorId: string; reason?: string }) => {
      if (viaApi) {
        await apiPost(`/admin/verification/${tutorId}/reject`, reason ? { reason } : {});
        return;
      }
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

type BookingRowDb = Database["public"]["Tables"]["bookings"]["Row"];

export type AdminBooking = Pick<
  BookingRowDb,
  | "id"
  | "student_id"
  | "tutor_id"
  | "booked_by"
  | "subject_id"
  | "starts_at"
  | "ends_at"
  | "duration_minutes"
  | "status"
  | "currency"
  | "total_amount"
  | "cancellation_policy_id"
  | "cancelled_at"
  | "cancellation_reason"
  | "created_at"
> & {
  students: { first_name: string; last_name: string | null } | null;
  tutors: { id: string; profiles: { full_name: string | null } | null } | null;
  subjects: { name: string } | null;
};

const ADMIN_BOOKING_SELECT =
  "id, student_id, tutor_id, booked_by, subject_id, starts_at, ends_at, duration_minutes, status, currency, total_amount, cancellation_policy_id, cancelled_at, cancellation_reason, created_at, students(first_name, last_name), tutors(id, profiles(full_name)), subjects(name)";

/** Flat admin API row → the nested shape the page reads. */
function toAdminBooking(row: Record<string, unknown>): AdminBooking {
  const r = row as Record<string, string | number | null>;
  return {
    id: r["id"] as string,
    student_id: r["student_id"] as string,
    tutor_id: r["tutor_id"] as string,
    booked_by: r["booked_by"] as string,
    subject_id: r["subject_id"] as string | null,
    starts_at: r["starts_at"] as string,
    ends_at: r["ends_at"] as string,
    duration_minutes: Number(r["duration_minutes"]),
    status: r["status"] as BookingStatus,
    currency: r["currency"] as string,
    total_amount: Number(r["total_amount"]),
    cancellation_policy_id: r["cancellation_policy_id"] as string | null,
    cancelled_at: r["cancelled_at"] as string | null,
    cancellation_reason: r["cancellation_reason"] as string | null,
    created_at: r["created_at"] as string,
    students: r["student_first_name"]
      ? {
          first_name: r["student_first_name"] as string,
          last_name: r["student_last_name"] as string | null,
        }
      : null,
    tutors: {
      id: r["tutor_id"] as string,
      profiles: { full_name: r["tutor_name"] as string | null },
    },
    subjects: r["subject_name"] ? { name: r["subject_name"] as string } : null,
  };
}

export function useAdminBookings(params?: {
  search?: string;
  status?: BookingStatus | "all";
  from?: string;
  to?: string;
}) {
  const search = params?.search?.trim() ?? "";
  const status = params?.status ?? "all";
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["admin-bookings", search, status, params?.from ?? null, params?.to ?? null],
    queryFn: async (): Promise<AdminBooking[]> => {
      if (viaApi) {
        const query = new URLSearchParams({ status });
        if (search) query.set("search", search);
        if (params?.from) query.set("from", params.from);
        if (params?.to) query.set("to", params.to);
        const rows = await apiGet<Record<string, unknown>[]>(`/admin/bookings?${query.toString()}`);
        return rows.map(toAdminBooking);
      }
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
      let rows = (data ?? []) as AdminBooking[];

      if (search) {
        const needle = search.toLowerCase();
        rows = rows.filter((row) => {
          const studentName =
            `${row.students?.first_name ?? ""} ${row.students?.last_name ?? ""}`.toLowerCase();
          const tutorName = (row.tutors?.profiles?.full_name ?? "").toLowerCase();
          return studentName.includes(needle) || tutorName.includes(needle);
        });
      }
      return rows;
    },
  });
}

/** Non-financial status overrides only — cancellation always goes through
 * useAdminCancelBooking() so the refund calculation isn't bypassed. */
export function useAdminUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      if (viaApi) {
        await apiPatch(`/admin/bookings/${id}/status`, { status });
        return;
      }
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
 * explicit override) to any paid payment, via admin_cancel_booking(). That
 * function only runs once a second admin approves the request this submits;
 * the hook resolves to the request id. */
export function useAdminCancelBooking() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      bookingId: string;
      reason: string;
      refundPercentage?: number | null;
    }) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>(
          `/admin/bookings/${input.bookingId}/cancel`,
          {
            reason: input.reason,
            ...(input.refundPercentage === null || input.refundPercentage === undefined
              ? {}
              : { refundPercentage: input.refundPercentage }),
          },
        );
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: "booking.cancel_with_refund",
        p_payload: {
          booking_id: input.bookingId,
          reason: input.reason,
          refund_percentage: input.refundPercentage ?? null,
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payments & refunds (Phase 2)                                         */
/* ------------------------------------------------------------------ */

type PaymentRowDb = Database["public"]["Tables"]["payments"]["Row"];

export type AdminPayment = Pick<
  PaymentRowDb,
  | "id"
  | "booking_id"
  | "tutor_id"
  | "payer_id"
  | "amount"
  | "currency"
  | "status"
  | "provider"
  | "provider_reference"
  | "paid_at"
  | "refunded_amount"
  | "created_at"
> & {
  bookings: {
    starts_at: string;
    students: { first_name: string; last_name: string | null } | null;
    tutors: { profiles: { full_name: string | null } | null } | null;
  } | null;
};

const ADMIN_PAYMENT_SELECT =
  "id, booking_id, tutor_id, payer_id, amount, currency, status, provider, provider_reference, paid_at, refunded_amount, created_at, bookings(starts_at, students(first_name, last_name), tutors(profiles(full_name)))";

function toAdminPayment(row: Record<string, unknown>): AdminPayment {
  const r = row as Record<string, string | number | null>;
  return {
    id: r["id"] as string,
    booking_id: r["booking_id"] as string,
    tutor_id: r["tutor_id"] as string,
    payer_id: r["payer_id"] as string,
    amount: Number(r["amount"]),
    currency: r["currency"] as string,
    status: r["status"] as PaymentStatus,
    provider: r["provider"] as string | null,
    provider_reference: r["provider_reference"] as string | null,
    paid_at: r["paid_at"] as string | null,
    refunded_amount: r["refunded_amount"] === null ? null : Number(r["refunded_amount"]),
    created_at: r["created_at"] as string,
    bookings: r["booking_starts_at"]
      ? {
          starts_at: r["booking_starts_at"] as string,
          students: r["student_first_name"]
            ? {
                first_name: r["student_first_name"] as string,
                last_name: r["student_last_name"] as string | null,
              }
            : null,
          tutors: { profiles: { full_name: r["tutor_name"] as string | null } },
        }
      : null,
  } as AdminPayment;
}

export function useAdminPayments(params?: {
  status?: PaymentStatus | "all" | "flagged";
  from?: string;
  to?: string;
}) {
  const status = params?.status ?? "all";
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["admin-payments", status, params?.from ?? null, params?.to ?? null],
    queryFn: async (): Promise<AdminPayment[]> => {
      if (viaApi) {
        // "flagged" is computed server-side: failed, or stuck for over a day.
        const query = new URLSearchParams({ status });
        if (params?.from) query.set("from", params.from);
        if (params?.to) query.set("to", params.to);
        const rows = await apiGet<Record<string, unknown>[]>(`/admin/payments?${query.toString()}`);
        return rows.map(toAdminPayment);
      }
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
      let rows = (data ?? []) as AdminPayment[];

      // "Flagged" isn't a stored column — nothing in this schema tracks it —
      // so it's a filter: failed payments, plus pending/processing ones
      // stuck for more than 24 hours.
      if (status === "flagged") {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        rows = rows.filter(
          (row) =>
            row.status === "failed" ||
            (["pending", "processing"].includes(row.status) &&
              new Date(row.created_at).getTime() < cutoff),
        );
      }
      return rows;
    },
  });
}

export function useAdminRefunds() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async (): Promise<AdminPayment[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>("/admin/payments?status=refunded");
        return rows.map(toAdminPayment);
      }
      const { data, error } = await supabase
        .from("payments")
        .select(ADMIN_PAYMENT_SELECT)
        .gt("refunded_amount", 0)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as AdminPayment[];
    },
  });
}

/** Submits the refund for approval. The clamp against the payment total
 * happens in the dispatcher, at execution time, so an amount cannot be made
 * stale by anything that happens while the request waits. */
export function useIssueRefund() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: string;
      amount: number;
      reason?: string;
    }) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>(`/admin/payments/${paymentId}/refund`, {
          amount,
          ...(reason ? { reason } : {}),
        });
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: "payment.refund",
        p_payload: { payment_id: paymentId, amount, reason: reason ?? null },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payouts (Phase 2)                                                     */
/* ------------------------------------------------------------------ */

export type AdminPayout = Pick<
  Database["public"]["Tables"]["payouts"]["Row"],
  | "id"
  | "tutor_id"
  | "amount"
  | "currency"
  | "status"
  | "reference"
  | "notes"
  | "requested_at"
  | "settled_at"
> & { tutors: { profiles: { full_name: string | null } | null } | null };

const ADMIN_PAYOUT_SELECT =
  "id, tutor_id, amount, currency, status, reference, notes, requested_at, settled_at, tutors(profiles(full_name))";

export function useAdminPayouts(params?: { status?: PayoutStatus | "all" }) {
  const status = params?.status ?? "all";
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["admin-payouts", status],
    queryFn: async (): Promise<AdminPayout[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>(`/admin/payouts?status=${status}`);
        return rows.map((row) => {
          const r = row as Record<string, string | number | null>;
          return {
            id: r["id"] as string,
            tutor_id: r["tutor_id"] as string,
            amount: Number(r["amount"]),
            currency: r["currency"] as string,
            status: r["status"] as PayoutStatus,
            reference: r["reference"] as string | null,
            notes: r["notes"] as string | null,
            requested_at: r["requested_at"] as string,
            settled_at: r["settled_at"] as string | null,
            tutors: { profiles: { full_name: r["tutor_name"] as string | null } },
          };
        });
      }
      let query = supabase
        .from("payouts")
        .select(ADMIN_PAYOUT_SELECT)
        .order("requested_at", { ascending: false })
        .limit(200);
      if (status !== "all") query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AdminPayout[];
    },
  });
}

/** Settling a payout moves money out, so it needs a second approver. */
export function useSettlePayout() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (id: string) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>(`/admin/payouts/${id}/settle`, {});
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: "payout.settle",
        p_payload: { payout_id: id },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
    },
  });
}

/** Rejecting moves no money, so it stays single-step. */
export function useRejectPayout() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (id: string) => {
      if (viaApi) {
        await apiPost(`/admin/payouts/${id}/reject`, {});
        return;
      }
      await governanceRpc<void>("admin_reject_payout", { p_payout_id: id, p_notes: null });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Disputes (Phase 4A)                                                   */
/* ------------------------------------------------------------------ */

// types.ts predates the disputes migration, so these are spelled out.
export type DisputeStatus = "open" | "investigating" | "resolved" | "dismissed";
export type DisputeCategory = "payment" | "conduct" | "quality" | "scheduling" | "other";

export interface AdminDispute {
  id: string;
  booking_id: string;
  category: DisputeCategory;
  status: DisputeStatus;
  description: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  raised_by_profile: { full_name: string | null } | null;
  against_profile: { full_name: string | null } | null;
  bookings: { starts_at: string; subjects: { name: string } | null } | null;
}

const ADMIN_DISPUTE_SELECT =
  "id, booking_id, category, status, description, resolution_notes, resolved_at, created_at, raised_by_profile:profiles!raised_by(full_name), against_profile:profiles!against_profile_id(full_name), bookings(starts_at, subjects(name))";

export function useAdminDisputes(status?: DisputeStatus | "all") {
  const filter = status ?? "open";
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-disputes", filter],
    queryFn: async (): Promise<AdminDispute[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>(`/admin/disputes?status=${filter}`);
        return rows.map((row) => {
          const r = row as Record<string, string | null>;
          return {
            id: r["id"] as string,
            booking_id: r["booking_id"] as string,
            category: r["category"] as DisputeCategory,
            status: r["status"] as DisputeStatus,
            description: r["description"] as string,
            resolution_notes: r["resolution_notes"] ?? null,
            resolved_at: r["resolved_at"] ?? null,
            created_at: r["created_at"] as string,
            raised_by_profile: { full_name: r["raised_by_name"] ?? null },
            against_profile: r["against_name"] ? { full_name: r["against_name"] } : null,
            bookings: r["booking_starts_at"]
              ? {
                  starts_at: r["booking_starts_at"],
                  subjects: r["subject_name"] ? { name: r["subject_name"] } : null,
                }
              : null,
          };
        });
      }
      let query = governanceTable<AdminDispute>("disputes")
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

export function useResolveDispute() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { disputeId: string; status: DisputeStatus; notes?: string }) => {
      if (viaApi) {
        await apiPost(`/admin/disputes/${input.disputeId}/resolve`, {
          status: input.status,
          ...(input.notes ? { notes: input.notes } : {}),
        });
        return;
      }
      await governanceRpc<void>("admin_resolve_dispute", {
        p_dispute_id: input.disputeId,
        p_status: input.status,
        p_resolution_notes: input.notes ?? null,
      });
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

export interface ModerationReview {
  id: string;
  score: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  tutor_id: string;
  tutors: { profiles: { full_name: string | null } | null } | null;
  profiles: { full_name: string | null } | null;
}

export function useModerationReviews(params?: { onlyPublished?: boolean }) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-moderation-reviews", params?.onlyPublished ?? "all"],
    queryFn: async (): Promise<ModerationReview[]> => {
      if (viaApi) {
        const query =
          params?.onlyPublished === undefined ? "" : `?published=${params.onlyPublished}`;
        const rows = await apiGet<Record<string, unknown>[]>(`/admin/moderation/reviews${query}`);
        return rows.map((row) => {
          const r = row as Record<string, string | number | boolean | null>;
          return {
            id: r["id"] as string,
            score: Number(r["score"]),
            comment: r["comment"] as string | null,
            is_published: r["is_published"] as boolean,
            created_at: r["created_at"] as string,
            tutor_id: r["tutor_id"] as string,
            tutors: { profiles: { full_name: r["tutor_name"] as string | null } },
            profiles: { full_name: r["rater_name"] as string | null },
          };
        });
      }
      let query = supabase
        .from("ratings")
        .select(
          "id, score, comment, is_published, created_at, tutor_id, tutors(profiles(full_name)), profiles!rater_id(full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (params?.onlyPublished !== undefined)
        query = query.eq("is_published", params.onlyPublished);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ModerationReview[];
    },
  });
}

export function useSetReviewPublished() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      if (viaApi) {
        await apiPatch(`/admin/moderation/reviews/${id}`, { isPublished });
        return;
      }
      const { error } = await supabase
        .from("ratings")
        .update({ is_published: isPublished })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-moderation-reviews"] }),
  });
}

export interface ModerationMessage {
  id: string;
  body: string;
  sender_id: string;
  is_hidden: boolean;
  created_at: string;
  conversation_id: string;
  profiles: { full_name: string | null } | null;
}

export function useModerationMessages(search?: string) {
  const needle = search?.trim() ?? "";
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-moderation-messages", needle],
    enabled: needle.length > 1,
    queryFn: async (): Promise<ModerationMessage[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>(
          `/admin/moderation/messages?search=${encodeURIComponent(needle)}`,
        );
        return rows.map((row) => {
          const r = row as Record<string, string | boolean | null>;
          return {
            id: r["id"] as string,
            body: r["body"] as string,
            sender_id: r["sender_id"] as string,
            is_hidden: r["is_hidden"] as boolean,
            created_at: r["created_at"] as string,
            conversation_id: r["conversation_id"] as string,
            profiles: { full_name: r["sender_name"] as string | null },
          };
        });
      }
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, body, sender_id, is_hidden, created_at, conversation_id, profiles!sender_id(full_name)",
        )
        .ilike("body", `%${needle}%`)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as ModerationMessage[];
    },
  });
}

export function useSetMessageHidden() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({
      id,
      isHidden,
      reason,
    }: {
      id: string;
      isHidden: boolean;
      reason?: string;
    }) => {
      if (viaApi) {
        await apiPatch(`/admin/moderation/messages/${id}`, {
          isHidden,
          ...(isHidden && reason ? { reason } : {}),
        });
        return;
      }
      const { error } = await supabase
        .from("messages")
        .update({ is_hidden: isHidden, hidden_reason: isHidden ? (reason ?? null) : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["admin-moderation-messages"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Reports (Phase 3)                                                     */
/* ------------------------------------------------------------------ */

/** admin_report_summary(), as the live function returns it. */
export interface AdminReportSummary {
  new_students: number;
  new_parents: number;
  new_tutors: number;
  bookings_count: number;
  completed_count: number;
  cancelled_count: number;
  no_show_count: number;
  gmv: number;
  gmv_currency: string | null;
  commission_revenue: number;
  avg_transaction_value: number | null;
  active_users: number;
  avg_tutor_rating: number | null;
}

export function useAdminReportSummary(from: string, to: string) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["admin-report-summary", from, to],
    enabled: Boolean(from && to),
    queryFn: async (): Promise<AdminReportSummary | null> => {
      if (viaApi) {
        const row = await apiGet<Record<string, unknown> | null>(
          `/admin/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        );
        return row ? numericRow<AdminReportSummary>(row, ["gmv_currency"]) : null;
      }
      const rows = await governanceRpc<AdminReportSummary[] | null>("admin_report_summary", {
        p_from: from,
        p_to: to,
      });
      return rows?.[0] ?? null;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                 */
/* ------------------------------------------------------------------ */

export const ROLE_LABEL: Record<AppRole, string> = {
  student: "Student",
  parent: "Parent",
  tutor: "Tutor",
  agency: "Agency",
  admin: "Admin",
  super_admin: "Super admin",
};
