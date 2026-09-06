import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

export type TutorRow = Database["public"]["Tables"]["tutors"]["Row"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];

/* ------------------------------------------------------------------ */
/* Tutor record                                                        */
/* ------------------------------------------------------------------ */

/** The signed-in tutor's own record. Created on demand by the backend. */
export function useTutorRecord() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["tutor-record", user?.id],
    enabled: Boolean(user?.id) && !loading,
    queryFn: async () => {
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

  return useMutation({
    mutationFn: async (patch: Database["public"]["Tables"]["tutors"]["Update"]) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
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
  return useQuery({
    queryKey: ["tutor-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_dashboard_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export type TutorSummary = NonNullable<ReturnType<typeof useTutorSummary>["data"]>;

export function useTutorBookings(params?: {
  from?: string;
  to?: string;
  statuses?: BookingStatus[];
}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-bookings", user?.id, params?.from ?? null, params?.to ?? null, params?.statuses ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
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

export type TutorBooking = NonNullable<ReturnType<typeof useTutorBookings>["data"]>[number];

export function useTutorStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-students", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_students", {});
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type TutorStudent = NonNullable<ReturnType<typeof useTutorStudents>["data"]>[number];

export function useRespondToBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, accept }: { bookingId: string; accept: boolean }) => {
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
  return useQuery({
    queryKey: ["tutor-my-subjects", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_subjects")
        .select("id, subject_id, education_level_id, subjects(name), education_levels(name)")
        .eq("tutor_id", tutor!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddTutorSubject() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  return useMutation({
    mutationFn: async (input: { subjectId: string; educationLevelId: string | null }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
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
  return useMutation({
    mutationFn: async (id: string) => {
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
  return useQuery({
    queryKey: ["tutor-availability", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
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

export type AvailabilityWindow = NonNullable<ReturnType<typeof useAvailabilityWindows>["data"]>[number];

export function useAddAvailabilityWindow() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  return useMutation({
    mutationFn: async (input: { dayOfWeek: number; startTime: string; endTime: string }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
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
  return useMutation({
    mutationFn: async (input: { id: string; isActive: boolean }) => {
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
  return useMutation({
    mutationFn: async (id: string) => {
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

export function useVerificationSteps() {
  return useQuery({
    queryKey: ["verification-steps", "tutor"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
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

export type VerificationStep = NonNullable<ReturnType<typeof useVerificationSteps>["data"]>[number];

export function useVerificationProgress() {
  const { data: tutor } = useTutorRecord();
  return useQuery({
    queryKey: ["tutor-verification-progress", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
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
  return useQuery({
    queryKey: ["tutor-documents", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_documents")
        .select("id, step_id, label, storage_path, mime_type, size_bytes, status, reviewer_notes, created_at")
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type TutorDocument = NonNullable<ReturnType<typeof useTutorDocuments>["data"]>[number];

export function useUploadTutorDocument() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
  return useMutation({
    mutationFn: async (input: { file: File; label: string; stepId?: string | null }) => {
      if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
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
  return useMutation({
    mutationFn: async (doc: { id: string; storage_path: string }) => {
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
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("tutor_submit_verification");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor-record"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["tutor-verification-progress"] });
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
