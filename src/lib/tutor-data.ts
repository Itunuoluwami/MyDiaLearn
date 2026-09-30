import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { apiDelete, apiGet, apiPatch, apiPost, apiUpload, useApiData } from "@/lib/api/data-client";
import type { Database } from "@/integrations/supabase/types";

export type TutorRow = Database["public"]["Tables"]["tutors"]["Row"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];

type FnReturns<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T]["Returns"];
type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TutorSummary = FnReturns<"tutor_dashboard_summary">[number];
export type TutorBooking = FnReturns<"tutor_bookings">[number];
export type TutorStudent = FnReturns<"tutor_students">[number];
export type AvailabilityWindow = Pick<
  TableRow<"availability_windows">,
  "id" | "day_of_week" | "start_time" | "end_time" | "timezone" | "is_active"
>;
export type VerificationStep = Pick<
  TableRow<"verification_steps">,
  "id" | "code" | "name" | "description" | "is_required" | "sort_order"
>;
export type VerificationProgress = Pick<
  TableRow<"tutor_verification_progress">,
  "id" | "step_id" | "status" | "reviewer_notes" | "reviewed_at"
>;
export type TutorDocument = Pick<
  TableRow<"tutor_documents">,
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
export type MyTutorSubject = Pick<
  TableRow<"tutor_subjects">,
  "id" | "subject_id" | "education_level_id"
> & {
  subjects: { name: string } | null;
  education_levels: { name: string } | null;
};

/* ------------------------------------------------------------------ */
/* API shapes (camelCase) and adapters back to the portal's shapes     */
/* ------------------------------------------------------------------ */
//
// The pages were written against Supabase rows (snake_case). The API speaks
// camelCase and returns money as strings (numeric → Decimal → JSON string), so
// each adapter restores the shape the pages already read. Raw function rows
// (dashboard, schedule, students) come back snake_case but with numeric and
// bigint columns possibly stringified, hence `toNumber`.

interface ApiTutorProfile {
  id: string;
  profileId: string;
  agencyId: string | null;
  headline: string | null;
  biography: string | null;
  qualifications: string[];
  languages: string[];
  education: string[];
  hourlyRate: string | null;
  currency: string;
  yearsExperience: number | null;
  introVideoUrl: string | null;
  timezone: string;
  verificationStatus: VerificationStatus;
  isListed: boolean;
  methodology: string | null;
  teachingContext: string | null;
  onboardingStep: number;
  submittedAt: string | null;
}

interface ApiTutorSubject {
  id: string;
  subjectId: string;
  subjectName: string | null;
  educationLevelId: string | null;
  levelName: string | null;
}

interface ApiAvailabilityWindow {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

interface ApiVerificationStep {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  status: VerificationProgress["status"] | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
}

interface ApiTutorDocument {
  id: string;
  stepId: string | null;
  label: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: TutorDocument["status"];
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function toTutorRow(t: ApiTutorProfile): TutorRow {
  return {
    id: t.id,
    profile_id: t.profileId,
    agency_id: t.agencyId,
    headline: t.headline,
    biography: t.biography,
    qualifications: t.qualifications,
    languages: t.languages,
    education: t.education,
    hourly_rate: t.hourlyRate === null ? null : Number(t.hourlyRate),
    currency: t.currency,
    years_experience: t.yearsExperience,
    intro_video_url: t.introVideoUrl,
    timezone: t.timezone,
    verification_status: t.verificationStatus,
    is_listed: t.isListed,
    methodology: t.methodology,
    teaching_context: t.teachingContext,
    onboarding_step: t.onboardingStep,
    submitted_at: t.submittedAt,
  } as TutorRow;
}

/** snake_case Update → the API's camelCase PATCH body. Unknown keys are dropped. */
const UPDATE_FIELD_MAP: Partial<Record<keyof TutorUpdate, string>> = {
  headline: "headline",
  biography: "biography",
  qualifications: "qualifications",
  languages: "languages",
  education: "education",
  years_experience: "yearsExperience",
  intro_video_url: "introVideoUrl",
  timezone: "timezone",
  methodology: "methodology",
  teaching_context: "teachingContext",
  onboarding_step: "onboardingStep",
  is_listed: "isListed",
};

type TutorUpdate = Database["public"]["Tables"]["tutors"]["Update"];

function toUpdateBody(patch: TutorUpdate): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const apiKey = UPDATE_FIELD_MAP[key as keyof TutorUpdate];
    if (apiKey && value !== undefined) body[apiKey] = value;
  }
  return body;
}

function toSummary(row: Record<string, unknown>): TutorSummary {
  return {
    ...row,
    active_students: toNumber(row["active_students"]),
    classes_today: toNumber(row["classes_today"]),
    completed_lessons: toNumber(row["completed_lessons"]),
    hourly_rate: toNumber(row["hourly_rate"]),
    onboarding_step: toNumber(row["onboarding_step"]),
    pending_requests: toNumber(row["pending_requests"]),
    upcoming_classes: toNumber(row["upcoming_classes"]),
  } as TutorSummary;
}

function toTutorBooking(row: Record<string, unknown>): TutorBooking {
  return {
    ...row,
    duration_minutes: toNumber(row["duration_minutes"]),
    hourly_rate: toNumber(row["hourly_rate"]),
    total_amount: toNumber(row["total_amount"]),
    payment_amount: row["payment_amount"] == null ? null : toNumber(row["payment_amount"]),
  } as TutorBooking;
}

function toTutorStudent(row: Record<string, unknown>): TutorStudent {
  return {
    ...row,
    lessons_completed: toNumber(row["lessons_completed"]),
    lessons_upcoming: toNumber(row["lessons_upcoming"]),
  } as TutorStudent;
}

function toMySubject(s: ApiTutorSubject): MyTutorSubject {
  return {
    id: s.id,
    subject_id: s.subjectId,
    education_level_id: s.educationLevelId,
    subjects: s.subjectName ? { name: s.subjectName } : null,
    education_levels: s.levelName ? { name: s.levelName } : null,
  };
}

function toWindow(w: ApiAvailabilityWindow): AvailabilityWindow {
  return {
    id: w.id,
    day_of_week: w.dayOfWeek,
    start_time: w.startTime,
    end_time: w.endTime,
    timezone: w.timezone,
    is_active: w.isActive,
  };
}

function toDocument(d: ApiTutorDocument): TutorDocument {
  return {
    id: d.id,
    step_id: d.stepId,
    label: d.label,
    // The API does not expose storage paths; deletion goes by id.
    storage_path: "",
    mime_type: d.mimeType,
    size_bytes: d.sizeBytes,
    status: d.status,
    reviewer_notes: d.reviewerNotes,
    created_at: d.createdAt,
  };
}

/* ------------------------------------------------------------------ */
/* Tutor record                                                        */
/* ------------------------------------------------------------------ */

/** The signed-in tutor's own record. Created on demand by the backend. */
export function useTutorRecord() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["tutor-record", user?.id],
    enabled: Boolean(user?.id) && !loading,
    queryFn: async (): Promise<TutorRow | null> => {
      if (viaApi) {
        // GET /tutors/me creates the record on first access.
        return toTutorRow(await apiGet<ApiTutorProfile>("/tutors/me"));
      }

      const existing = await supabase
        .from("tutors")
        .select("*")
        .eq("profile_id", user!.id)
        .maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data) return existing.data as TutorRow;

      const created = await supabase.rpc("ensure_tutor_record");
      if (created.error) throw created.error;
      const reread = await supabase
        .from("tutors")
        .select("*")
        .eq("profile_id", user!.id)
        .maybeSingle();
      if (reread.error) throw reread.error;
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
      return (reread.data ?? null) as TutorRow | null;
    },
  });
}

export function useUpdateTutor() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();

  return useMutation({
    mutationFn: async (patch: TutorUpdate) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        await apiPatch("/tutors/me", toUpdateBody(patch));
        return;
      }
      const { error } = await supabase.from("tutors").update(patch).eq("id", tutor.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-record"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Dashboard, classes, students                                        */
/* ------------------------------------------------------------------ */

export function useTutorSummary() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<TutorSummary | null> => {
      if (viaApi) {
        const row = await apiGet<Record<string, unknown> | null>("/tutors/me/dashboard");
        return row ? toSummary(row) : null;
      }
      const { data, error } = await supabase.rpc("tutor_dashboard_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useTutorBookings(params?: {
  from?: string;
  to?: string;
  statuses?: BookingStatus[];
}) {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: [
      "tutor-bookings",
      user?.id,
      params?.from ?? null,
      params?.to ?? null,
      params?.statuses ?? null,
    ],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<TutorBooking[]> => {
      if (viaApi) {
        const search = new URLSearchParams();
        if (params?.from) search.set("from", params.from);
        if (params?.to) search.set("to", params.to);
        if (params?.statuses?.length) search.set("statuses", params.statuses.join(","));
        const query = search.toString();
        const rows = await apiGet<Record<string, unknown>[]>(
          `/bookings/tutor-schedule${query ? `?${query}` : ""}`,
        );
        return rows.map(toTutorBooking);
      }
      const { data, error } = await supabase.rpc("tutor_bookings", {
        ...(params?.from ? { p_from: params.from } : {}),
        ...(params?.to ? { p_to: params.to } : {}),
        ...(params?.statuses ? { p_statuses: params.statuses } : {}),
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTutorStudents() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-students", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<TutorStudent[]> => {
      if (viaApi) {
        // The API caps a page at 100; the Supabase path used the function default.
        const rows = await apiGet<Record<string, unknown>[]>("/tutors/me/students?limit=100");
        return rows.map(toTutorStudent);
      }
      const { data, error } = await supabase.rpc("tutor_students", {});
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRespondToBooking() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async ({ bookingId, accept }: { bookingId: string; accept: boolean }) => {
      if (viaApi) {
        return apiPost<unknown>(`/bookings/${bookingId}/respond`, { accept });
      }
      const { data, error } = await supabase.rpc("tutor_respond_booking", {
        p_booking_id: bookingId,
        p_accept: accept,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-students"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Subjects taught (admin-managed lookup tables)                       */
/* ------------------------------------------------------------------ */

export function useMyTutorSubjects() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-my-subjects", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<MyTutorSubject[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiTutorSubject[]>("/tutors/me/subjects");
        return rows.map(toMySubject);
      }
      const { data, error } = await supabase
        .from("tutor_subjects")
        .select("id, subject_id, education_level_id, subjects(name), education_levels(name)")
        .eq("tutor_id", tutor!.id);
      if (error) throw error;
      return (data ?? []) as MyTutorSubject[];
    },
  });
}

export function useAddTutorSubject() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { subjectId: string; educationLevelId: string | null }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        await apiPost("/tutors/me/subjects", {
          subjectId: input.subjectId,
          ...(input.educationLevelId ? { educationLevelId: input.educationLevelId } : {}),
        });
        return;
      }
      const { error } = await supabase.from("tutor_subjects").insert({
        tutor_id: tutor.id,
        subject_id: input.subjectId,
        education_level_id: input.educationLevelId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-my-subjects"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

export function useRemoveTutorSubject() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (id: string) => {
      if (viaApi) {
        await apiDelete(`/tutors/me/subjects/${id}`);
        return;
      }
      const { error } = await supabase.from("tutor_subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-my-subjects"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Availability windows                                                */
/* ------------------------------------------------------------------ */

export function useAvailabilityWindows() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-availability", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<AvailabilityWindow[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiAvailabilityWindow[]>("/tutors/me/availability");
        return rows.map(toWindow);
      }
      const { data, error } = await supabase
        .from("availability_windows")
        .select("id, day_of_week, start_time, end_time, timezone, is_active")
        .eq("tutor_id", tutor!.id)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddAvailabilityWindow() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { dayOfWeek: number; startTime: string; endTime: string }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        // The server stamps the tutor's own timezone on the window.
        await apiPost("/tutors/me/availability/window", input);
        return;
      }
      const { error } = await supabase.from("availability_windows").insert({
        tutor_id: tutor.id,
        day_of_week: input.dayOfWeek,
        start_time: input.startTime,
        end_time: input.endTime,
        timezone: tutor.timezone,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

export function useUpdateAvailabilityWindow() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { id: string; isActive: boolean }) => {
      if (viaApi) {
        await apiPatch(`/tutors/me/availability/${input.id}`, { isActive: input.isActive });
        return;
      }
      const { error } = await supabase
        .from("availability_windows")
        .update({ is_active: input.isActive })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

export function useDeleteAvailabilityWindow() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (id: string) => {
      if (viaApi) {
        await apiDelete(`/tutors/me/availability/${id}`);
        return;
      }
      const { error } = await supabase.from("availability_windows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Verification (steps and documents are admin-defined)                */
/* ------------------------------------------------------------------ */
//
// The API returns steps and the tutor's progress merged in one call
// (/tutors/me/verification); both hooks read it and split it back apart.

export function useVerificationSteps() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["verification-steps", "tutor", viaApi ? user?.id : null],
    enabled: !viaApi || Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<VerificationStep[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiVerificationStep[]>("/tutors/me/verification");
        return rows.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          description: s.description,
          is_required: s.isRequired,
          sort_order: s.sortOrder,
        }));
      }
      const { data, error } = await supabase
        .from("verification_steps")
        .select("id, code, name, description, is_required, sort_order")
        .eq("is_active", true)
        .eq("applies_to", "tutor")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useVerificationProgress() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-verification-progress", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<VerificationProgress[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiVerificationStep[]>("/tutors/me/verification");
        return rows
          .filter((s) => s.status !== null)
          .map((s) => ({
            // The merged view has no progress-row id; the step id is unique per tutor.
            id: s.id,
            step_id: s.id,
            status: s.status!,
            reviewer_notes: s.reviewerNotes,
            reviewed_at: s.reviewedAt,
          }));
      }
      const { data, error } = await supabase
        .from("tutor_verification_progress")
        .select("id, step_id, status, reviewer_notes, reviewed_at")
        .eq("tutor_id", tutor!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTutorDocuments() {
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-documents", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async (): Promise<TutorDocument[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiTutorDocument[]>("/tutors/me/documents");
        return rows.map(toDocument);
      }
      const { data, error } = await supabase
        .from("tutor_documents")
        .select(
          "id, step_id, label, storage_path, mime_type, size_bytes, status, reviewer_notes, created_at",
        )
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUploadTutorDocument() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { file: File; label: string; stepId?: string | null }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
      if (viaApi) {
        const uploaded = await apiUpload("tutor-documents", input.file);
        await apiPost("/tutors/me/documents", {
          label: input.label,
          storagePath: uploaded.storagePath,
          sizeBytes: uploaded.sizeBytes,
          ...(input.stepId ? { stepId: input.stepId } : {}),
          ...(uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}),
        });
        return;
      }
      const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${tutor.id}/${crypto.randomUUID()}.${extension}`;

      const upload = await supabase.storage.from("tutor-documents").upload(path, input.file, {
        ...(input.file.type ? { contentType: input.file.type } : {}),
        upsert: false,
      });
      if (upload.error) throw upload.error;

      const { error } = await supabase.from("tutor_documents").insert({
        tutor_id: tutor.id,
        step_id: input.stepId ?? null,
        label: input.label,
        storage_path: path,
        mime_type: input.file.type || null,
        size_bytes: input.file.size,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-documents"] });
    },
  });
}

export function useDeleteTutorDocument() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (doc: { id: string; storage_path: string }) => {
      if (viaApi) {
        await apiDelete(`/tutors/me/documents/${doc.id}`);
        return;
      }
      await supabase.storage.from("tutor-documents").remove([doc.storage_path]);
      const { error } = await supabase.from("tutor_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-documents"] });
    },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async () => {
      if (viaApi) {
        const result = await apiPost<{ status: VerificationStatus }>(
          "/tutors/me/verification/submit",
          {},
        );
        return result.status;
      }
      const { data, error } = await supabase.rpc("tutor_submit_verification");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-record"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-verification-progress"] });
      void queryClient.invalidateQueries({ queryKey: ["verification-steps"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Presentation helpers (labels only — values stay backend-owned)       */
/* ------------------------------------------------------------------ */

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  unverified: "Not submitted",
  pending: "Submitted for review",
  in_review: "Under review",
  verified: "Verified",
  rejected: "Needs changes",
  suspended: "Suspended",
};

export const VERIFICATION_TONE: Record<VerificationStatus, string> = {
  unverified: "bg-muted text-muted-foreground",
  pending: "bg-secondary-soft text-foreground",
  in_review: "bg-primary-soft text-primary-deep",
  verified: "bg-success/12 text-success",
  rejected: "bg-destructive/12 text-destructive",
  suspended: "bg-destructive/12 text-destructive",
};

/** Weekday labels for availability. Index matches the stored day_of_week (0 = Sunday). */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function useTutorTimezone() {
  const { data: tutor } = useTutorRecord();
  const { profile } = useAuth();
  return tutor?.timezone || profile?.timezone || "UTC";
}
