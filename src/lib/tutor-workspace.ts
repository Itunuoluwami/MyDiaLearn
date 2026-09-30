import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import {
  API_FILE_PREFIX,
  apiDelete,
  apiGet,
  apiPost,
  apiUpload,
  openApiFile,
  useApiData,
} from "@/lib/api/data-client";
import { apiRequest } from "@/lib/api/client";
import { authClient } from "@/lib/auth";
import { useTutorRecord } from "@/lib/tutor-data";

export type ResourceType = Database["public"]["Enums"]["resource_type"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];
export type PayoutStatus = Database["public"]["Enums"]["payout_status"];

type Tables = Database["public"]["Tables"];
type FnRow<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T]["Returns"] extends (infer R)[] ? R : never;

const RESOURCE_BUCKET = "learning-resources";

/** Raw function rows arrive with NUMERIC/bigint columns possibly stringified. */
function withNumbers<T>(row: Record<string, unknown>, keys: readonly string[]): T {
  const out: Record<string, unknown> = { ...row };
  for (const key of keys) {
    const value = out[key];
    if (value !== null && value !== undefined) out[key] = Number(value);
  }
  return out as T;
}

/** PUT with the session token; data-client has no apiPut. */
async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const { data } = await authClient.getSession();
  const accessToken = data.session?.access_token;
  return apiRequest<T>(path, { method: "PUT", body, ...(accessToken ? { accessToken } : {}) });
}

/* ------------------------------------------------------------------ */
/* Classroom (access is authorised in the database)                    */
/* ------------------------------------------------------------------ */

export type ClassSessionView = FnRow<"tutor_open_class">;

export function useClassSession(bookingId: string | undefined) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-class-session", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async (): Promise<ClassSessionView | null> => {
      if (viaApi) {
        const row = await apiPost<Record<string, unknown>>(`/bookings/${bookingId}/class/open`, {});
        return row ? withNumbers<ClassSessionView>(row, ["duration_minutes"]) : null;
      }
      const { data, error } = await supabase.rpc("tutor_open_class", { p_booking_id: bookingId! });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useStartClass() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (viaApi) {
        await apiPost(`/bookings/${bookingId}/class/start`, {});
        return;
      }
      const { error } = await supabase.rpc("tutor_start_class", { p_booking_id: bookingId });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-class-session"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
    },
  });
}

export function useEndClass() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { bookingId: string; studentAttended?: boolean }) => {
      if (viaApi) {
        await apiPost(
          `/bookings/${input.bookingId}/class/end`,
          input.studentAttended === undefined ? {} : { studentAttended: input.studentAttended },
        );
        return;
      }
      const { error } = await supabase.rpc("tutor_end_class", {
        p_booking_id: input.bookingId,
        ...(input.studentAttended === undefined
          ? {}
          : { p_student_attended: input.studentAttended }),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-class-session"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Lesson notes                                                        */
/* ------------------------------------------------------------------ */

export type LessonNote = Tables["lesson_notes"]["Row"];

interface ApiLessonNote {
  id: string;
  bookingId: string;
  covered: string | null;
  understanding: string | null;
  improvements: string | null;
  nextSteps: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useLessonNote(bookingId: string | undefined) {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-lesson-note", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async (): Promise<LessonNote | null> => {
      if (viaApi) {
        const notes = await apiGet<ApiLessonNote[]>(`/bookings/${bookingId}/lesson-notes`);
        const note = notes[0];
        if (!note) return null;
        return {
          id: note.id,
          booking_id: note.bookingId,
          tutor_id: tutor?.id ?? "",
          covered: note.covered,
          understanding: note.understanding,
          improvements: note.improvements,
          next_steps: note.nextSteps,
          created_at: note.createdAt,
          updated_at: note.updatedAt,
        };
      }
      const { data, error } = await supabase
        .from("lesson_notes")
        .select("*")
        .eq("booking_id", bookingId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as LessonNote | null;
    },
  });
}

export function useSaveLessonNote(bookingId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      covered: string;
      understanding: string;
      improvements: string;
      next_steps: string;
    }) => {
      if (!tutor?.id || !bookingId) throw new Error("Lesson is not ready yet.");
      if (viaApi) {
        await apiPut(`/bookings/${bookingId}/lesson-notes`, {
          covered: input.covered,
          understanding: input.understanding,
          improvements: input.improvements,
          nextSteps: input.next_steps,
        });
        return;
      }
      const { error } = await supabase
        .from("lesson_notes")
        .upsert(
          { booking_id: bookingId, tutor_id: tutor.id, ...input },
          { onConflict: "booking_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-lesson-note"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Learning resources                                                  */
/* ------------------------------------------------------------------ */

export type LearningResource = Tables["learning_resources"]["Row"];
export type LearningResourceRow = LearningResource & {
  subjects: { name: string } | null;
  students: { first_name: string } | null;
};

interface ApiResource {
  id: string;
  title: string;
  description: string | null;
  resourceType: ResourceType;
  externalUrl: string | null;
  hasFile: boolean;
  subjectId: string | null;
  subjectName: string | null;
  studentId: string | null;
  studentFirstName: string | null;
  isShared: boolean;
  tutorId: string;
  createdAt: string;
}

export function useLearningResources() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-resources", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<LearningResourceRow[]> => {
      if (viaApi) {
        const page = await apiGet<{ data: ApiResource[] }>("/learning-resources?limit=100");
        return page.data
          .filter((r) => r.tutorId === tutor!.id)
          .map((r) => ({
            id: r.id,
            tutor_id: r.tutorId,
            title: r.title,
            description: r.description,
            resource_type: r.resourceType,
            external_url: r.externalUrl,
            // Storage keys are not exposed. A marker stands in so the page
            // still knows there is a file; openStoredFile resolves it.
            storage_path: r.hasFile ? `${API_FILE_PREFIX}${r.id}` : null,
            mime_type: null,
            size_bytes: null,
            subject_id: r.subjectId,
            student_id: r.studentId,
            is_shared: r.isShared,
            created_at: r.createdAt,
            updated_at: r.createdAt,
            subjects: r.subjectName ? { name: r.subjectName } : null,
            students: r.studentFirstName ? { first_name: r.studentFirstName } : null,
          }));
      }
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*, subjects(name), students(first_name)")
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LearningResourceRow[];
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string | null;
      resourceType: ResourceType;
      subjectId: string | null;
      studentId: string | null;
      externalUrl: string | null;
      file: File | null;
      onProgress?: (percent: number) => void;
    }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        const uploaded = input.file ? await apiUpload("learning-resources", input.file) : null;
        input.onProgress?.(85);
        await apiPost("/learning-resources", {
          title: input.title,
          resourceType: input.resourceType,
          ...(input.description ? { description: input.description } : {}),
          ...(input.externalUrl ? { externalUrl: input.externalUrl } : {}),
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
          ...(input.studentId ? { studentId: input.studentId } : {}),
          ...(uploaded
            ? {
                storagePath: uploaded.storagePath,
                sizeBytes: uploaded.sizeBytes,
                ...(uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}),
              }
            : {}),
        });
        input.onProgress?.(100);
        return;
      }
      let storagePath: string | null = null;
      let mime: string | null = null;
      let size: number | null = null;

      if (input.file) {
        const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
        storagePath = `${tutor.id}/${crypto.randomUUID()}.${extension}`;
        input.onProgress?.(15);
        const upload = await supabase.storage
          .from(RESOURCE_BUCKET)
          .upload(storagePath, input.file, {
            ...(input.file.type ? { contentType: input.file.type } : {}),
            upsert: false,
          });
        if (upload.error) throw upload.error;
        input.onProgress?.(85);
        mime = input.file.type || null;
        size = input.file.size;
      }

      const { error } = await supabase.from("learning_resources").insert({
        tutor_id: tutor.id,
        title: input.title,
        description: input.description,
        resource_type: input.resourceType,
        subject_id: input.subjectId,
        student_id: input.studentId,
        external_url: input.externalUrl,
        storage_path: storagePath,
        mime_type: mime,
        size_bytes: size,
      });
      if (error) throw error;
      input.onProgress?.(100);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-resources"] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (resource: { id: string; storage_path: string | null }) => {
      if (viaApi) {
        await apiDelete(`/learning-resources/${resource.id}`);
        return;
      }
      if (resource.storage_path) {
        await supabase.storage.from(RESOURCE_BUCKET).remove([resource.storage_path]);
      }
      const { error } = await supabase.from("learning_resources").delete().eq("id", resource.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-resources"] });
    },
  });
}

/**
 * Private files are only ever reachable through a short-lived signed link,
 * minted by the API (which checks access first) or by Supabase storage.
 */
export async function openStoredFile(path: string) {
  if (path.startsWith(API_FILE_PREFIX)) {
    await openApiFile(`/files/learning-resources/${path.slice(API_FILE_PREFIX.length)}/url`);
    return;
  }
  const { data, error } = await supabase.storage.from(RESOURCE_BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) throw error ?? new Error("Link unavailable");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export function useSignedResourceUrl(path: string | null | undefined, seconds = 3600) {
  return useQuery({
    queryKey: ["signed-resource", path, seconds],
    enabled: Boolean(path),
    staleTime: (seconds - 60) * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(RESOURCE_BUCKET)
        .createSignedUrl(path!, seconds);
      if (error) throw error;
      return data?.signedUrl ?? null;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Assignments                                                         */
/* ------------------------------------------------------------------ */

export type AssignmentRow = Tables["assignments"]["Row"] & {
  students: { first_name: string; avatar_url: string | null } | null;
  subjects: { name: string } | null;
  learning_resources: { title: string } | null;
};

interface ApiAssignment {
  id: string;
  studentId: string;
  studentFirstName: string | null;
  studentAvatarUrl: string | null;
  tutorId: string;
  bookingId: string | null;
  subjectId: string | null;
  subjectName: string | null;
  resourceId: string | null;
  resourceTitle: string | null;
  title: string;
  instructions: string | null;
  submissionRequirements: string | null;
  dueAt: string | null;
  status: AssignmentStatus;
  submissionText: string | null;
  submittedAt: string | null;
  feedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

function toAssignmentRow(a: ApiAssignment): AssignmentRow {
  return {
    id: a.id,
    tutor_id: a.tutorId,
    student_id: a.studentId,
    booking_id: a.bookingId,
    subject_id: a.subjectId,
    resource_id: a.resourceId,
    title: a.title,
    instructions: a.instructions,
    submission_requirements: a.submissionRequirements,
    due_at: a.dueAt,
    status: a.status,
    // Not in the API response; the page does not read it.
    assigned_at: null,
    submission_text: a.submissionText,
    submission_path: null,
    submitted_at: a.submittedAt,
    feedback: a.feedback,
    reviewed_at: a.reviewedAt,
    created_at: a.createdAt,
    updated_at: a.createdAt,
    students: a.studentFirstName
      ? { first_name: a.studentFirstName, avatar_url: a.studentAvatarUrl }
      : null,
    subjects: a.subjectName ? { name: a.subjectName } : null,
    learning_resources: a.resourceTitle ? { title: a.resourceTitle } : null,
  };
}

export function useAssignments(params?: { studentId?: string }) {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-assignments", tutor?.id, params?.studentId ?? null],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<AssignmentRow[]> => {
      if (viaApi) {
        const search = new URLSearchParams({ limit: "100" });
        if (params?.studentId) search.set("studentId", params.studentId);
        const page = await apiGet<{ data: ApiAssignment[] }>(`/assignments?${search.toString()}`);
        // Newest first, as the Supabase path orders them.
        return page.data
          .filter((a) => a.tutorId === tutor!.id)
          .map(toAssignmentRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      }
      let query = supabase
        .from("assignments")
        .select("*, students(first_name, avatar_url), subjects(name), learning_resources(title)")
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (params?.studentId) query = query.eq("student_id", params.studentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AssignmentRow[];
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      instructions: string | null;
      submissionRequirements: string | null;
      studentId: string;
      subjectId: string | null;
      resourceId: string | null;
      dueAt: string | null;
      assignNow: boolean;
    }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        await apiPost("/assignments", {
          studentId: input.studentId,
          title: input.title,
          assignNow: input.assignNow,
          ...(input.instructions ? { instructions: input.instructions } : {}),
          ...(input.submissionRequirements
            ? { submissionRequirements: input.submissionRequirements }
            : {}),
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
          ...(input.resourceId ? { resourceId: input.resourceId } : {}),
          ...(input.dueAt ? { dueAt: input.dueAt } : {}),
        });
        return;
      }
      const { error } = await supabase.from("assignments").insert({
        tutor_id: tutor.id,
        student_id: input.studentId,
        subject_id: input.subjectId,
        resource_id: input.resourceId,
        title: input.title,
        instructions: input.instructions,
        submission_requirements: input.submissionRequirements,
        due_at: input.dueAt,
        status: input.assignNow ? "assigned" : "draft",
        assigned_at: input.assignNow ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-assignments"] });
    },
  });
}

/**
 * Status changes the tutor makes. The API exposes them as actions rather than
 * a free-form patch: assigning a draft, and reviewing a submission.
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Tables["assignments"]["Update"] }) => {
      if (viaApi) {
        if (input.patch.status === "assigned") {
          await apiPost(`/assignments/${input.id}/assign`, {});
          return;
        }
        if (input.patch.status === "reviewed") {
          await apiPost(
            `/assignments/${input.id}/review`,
            input.patch.feedback ? { feedback: input.patch.feedback } : {},
          );
          return;
        }
        throw new Error("That change isn't supported yet.");
      }
      const { error } = await supabase.from("assignments").update(input.patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-assignments"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Earnings and payouts (all figures come from the backend)             */
/* ------------------------------------------------------------------ */

export type EarningsSummary = FnRow<"tutor_earnings_summary">;
export type EarningsRecord = FnRow<"tutor_earnings_records">;
export type PayoutRow = Tables["payouts"]["Row"];

interface ApiEarningsSummary {
  currency: string;
  grossRevenue: string;
  platformCommission: string;
  paymentFees: string;
  netEarnings: string;
  pendingEarnings: string;
  paidOut: string;
  pendingPayouts: string;
  availableBalance: string;
  minimumPayout: string;
  nextPayoutDate: string | null;
  scheduleLabel: string | null;
}

interface ApiPayout {
  id: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  reference: string | null;
  notes: string | null;
  requestedAt: string;
  settledAt: string | null;
}

export function useEarningsSummary() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-earnings-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<EarningsSummary | null> => {
      if (viaApi) {
        const s = await apiGet<ApiEarningsSummary | null>("/payments/earnings");
        if (!s) return null;
        return {
          currency: s.currency,
          gross_revenue: Number(s.grossRevenue),
          platform_commission: Number(s.platformCommission),
          payment_fees: Number(s.paymentFees),
          net_earnings: Number(s.netEarnings),
          pending_earnings: Number(s.pendingEarnings),
          paid_out: Number(s.paidOut),
          pending_payouts: Number(s.pendingPayouts),
          available_balance: Number(s.availableBalance),
          minimum_payout: Number(s.minimumPayout),
          next_payout_date: s.nextPayoutDate ?? "",
          schedule_label: s.scheduleLabel ?? "",
        };
      }
      const { data, error } = await supabase.rpc("tutor_earnings_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useEarningsRecords(limit = 50) {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-earnings-records", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<EarningsRecord[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>(
          `/payments/earnings/records?limit=${Math.min(limit, 100)}`,
        );
        return rows.map((row) =>
          withNumbers<EarningsRecord>(row, [
            "gross_amount",
            "commission_amount",
            "platform_fee",
            "net_amount",
            "exchange_rate",
          ]),
        );
      }
      const { data, error } = await supabase.rpc("tutor_earnings_records", { p_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePayouts() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-payouts", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<PayoutRow[]> => {
      if (viaApi) {
        const page = await apiGet<{ data: ApiPayout[] }>("/payments/payouts?limit=100");
        return page.data.map((p) => ({
          id: p.id,
          tutor_id: tutor!.id,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          reference: p.reference,
          notes: p.notes,
          requested_at: p.requestedAt,
          settled_at: p.settledAt,
          created_at: p.requestedAt,
          updated_at: p.settledAt ?? p.requestedAt,
        }));
      }
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("tutor_id", tutor!.id)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (viaApi) {
        const result = await apiPost<{ id: string }>("/payments/payouts", { amount });
        return result.id;
      }
      const { data, error } = await supabase.rpc("tutor_request_payout", { p_amount: amount });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-earnings-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export type RatingSummary = FnRow<"tutor_rating_summary">;
export type RatingCategory = FnRow<"tutor_rating_categories">;
export type TutorReview = FnRow<"tutor_reviews">;

export function useRatingSummary() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-rating-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<RatingSummary | null> => {
      if (viaApi) {
        const row = await apiGet<Record<string, unknown> | null>("/tutors/me/ratings/summary");
        return row
          ? withNumbers<RatingSummary>(row, [
              "rating_avg",
              "rating_count",
              "five_star",
              "four_star",
              "three_star",
              "two_star",
              "one_star",
            ])
          : null;
      }
      const { data, error } = await supabase.rpc("tutor_rating_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useRatingCategories() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-rating-categories", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<RatingCategory[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>("/tutors/me/ratings/categories");
        return rows.map((row) =>
          withNumbers<RatingCategory>(row, ["average_score", "response_count"]),
        );
      }
      const { data, error } = await supabase.rpc("tutor_rating_categories");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTutorReviews(limit = 20) {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-reviews", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<TutorReview[]> => {
      if (viaApi) {
        const rows = await apiGet<Record<string, unknown>[]>(
          `/tutors/me/reviews?limit=${Math.min(limit, 100)}`,
        );
        return rows.map((row) => withNumbers<TutorReview>(row, ["score"]));
      }
      const { data, error } = await supabase.rpc("tutor_reviews", { p_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Messaging                                                           */
/* ------------------------------------------------------------------ */

export type ConversationRow =
  Database["public"]["Functions"]["my_conversations"]["Returns"][number];
export type MessageRow = Pick<
  Database["public"]["Tables"]["messages"]["Row"],
  "id" | "body" | "sender_id" | "created_at" | "attachment_path" | "attachment_name"
>;

interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentName: string | null;
  isHidden: boolean;
  createdAt: string;
}

export function useConversations() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<ConversationRow[]> => {
      if (viaApi) {
        // my_conversations() rows, snake_case; only the unread count is numeric.
        const rows = await apiGet<ConversationRow[]>("/conversations");
        return rows.map((row) => ({ ...row, unread_count: Number(row.unread_count ?? 0) }));
      }
      const { data, error } = await supabase.rpc("my_conversations");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMessages(conversationId: string | undefined, limit = 100) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["messages", conversationId, limit],
    enabled: Boolean(conversationId),
    queryFn: async (): Promise<MessageRow[]> => {
      if (viaApi) {
        const page = await apiGet<{ data: ApiMessage[] }>(
          `/conversations/${conversationId}/messages?limit=${Math.min(limit, 100)}`,
        );
        // Moderated messages are left out, as the Supabase path does.
        return page.data
          .filter((m) => !m.isHidden)
          .map((m) => ({
            id: m.id,
            body: m.body,
            sender_id: m.senderId,
            created_at: m.createdAt,
            // The API does not expose storage keys; the name is enough to show.
            attachment_path: null,
            attachment_name: m.attachmentName,
          }));
      }
      const { data, error } = await supabase
        .from("messages")
        .select("id, body, sender_id, created_at, attachment_path, attachment_name")
        .eq("conversation_id", conversationId!)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).slice().reverse();
    },
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId || !user?.id) throw new Error("Conversation is not ready yet.");
      if (viaApi) {
        await apiPost(`/conversations/${conversationId}/messages`, { body });
        return;
      }
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) return;
      if (viaApi) {
        await apiPost(`/conversations/${conversationId}/read`, {});
        return;
      }
      const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { studentId: string; subject?: string }) => {
      if (viaApi) {
        const result = await apiPost<{ id: string }>("/conversations", {
          studentId: input.studentId,
          ...(input.subject ? { subject: input.subject } : {}),
        });
        return result.id;
      }
      const { data, error } = await supabase.rpc("tutor_start_conversation", {
        p_student_id: input.studentId,
        ...(input.subject ? { p_subject: input.subject } : {}),
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Presentation labels (states themselves are backend-owned)           */
/* ------------------------------------------------------------------ */

export const ASSIGNMENT_LABEL: Record<AssignmentStatus, string> = {
  draft: "Draft",
  assigned: "Assigned",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

export const ASSIGNMENT_TONE: Record<AssignmentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  assigned: "bg-primary-soft text-primary-deep",
  submitted: "bg-secondary-soft text-foreground",
  reviewed: "bg-success/12 text-success",
};

export const PAYOUT_LABEL: Record<PayoutStatus, string> = {
  requested: "Requested",
  processing: "Processing",
  paid: "Paid",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const PAYOUT_TONE: Record<PayoutStatus, string> = {
  requested: "bg-secondary-soft text-foreground",
  processing: "bg-primary-soft text-primary-deep",
  paid: "bg-success/12 text-success",
  rejected: "bg-destructive/12 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export const RESOURCE_LABEL: Record<ResourceType, string> = {
  pdf: "PDF",
  video: "Video",
  link: "Link",
  document: "Document",
  image: "Image",
  other: "File",
};
