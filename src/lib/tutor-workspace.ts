import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { useTutorRecord } from "@/lib/tutor-data";

export type ResourceType = Database["public"]["Enums"]["resource_type"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];
export type PayoutStatus = Database["public"]["Enums"]["payout_status"];

const RESOURCE_BUCKET = "learning-resources";

/* ------------------------------------------------------------------ */
/* Classroom (access is authorised in the database)                    */
/* ------------------------------------------------------------------ */

export function useClassSession(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["tutor-class-session", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_open_class", { p_booking_id: bookingId! });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export type ClassSessionView = NonNullable<ReturnType<typeof useClassSession>["data"]>;

export function useStartClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
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
  return useMutation({
    mutationFn: async (input: { bookingId: string; studentAttended?: boolean }) => {
      const { error } = await supabase.rpc("tutor_end_class", {
        p_booking_id: input.bookingId,
        ...(input.studentAttended === undefined ? {} : { p_student_attended: input.studentAttended }),
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

export type LessonNote = Database["public"]["Tables"]["lesson_notes"]["Row"];

export function useLessonNote(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["tutor-lesson-note", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async () => {
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
  return useMutation({
    mutationFn: async (input: {
      covered: string;
      understanding: string;
      improvements: string;
      next_steps: string;
    }) => {
      if (!tutor?.id || !bookingId) throw new Error("Lesson is not ready yet.");
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

export type LearningResource = Database["public"]["Tables"]["learning_resources"]["Row"];

export function useLearningResources() {
  const { data: tutor } = useTutorRecord();
  return useQuery({
    queryKey: ["tutor-resources", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*, subjects(name), students(first_name)")
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type LearningResourceRow = NonNullable<ReturnType<typeof useLearningResources>["data"]>[number];

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
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
      let storagePath: string | null = null;
      let mime: string | null = null;
      let size: number | null = null;

      if (input.file) {
        const extension = input.file.name.split(".").pop()?.toLowerCase() ?? "bin";
        storagePath = `${tutor.id}/${crypto.randomUUID()}.${extension}`;
        input.onProgress?.(15);
        const upload = await supabase.storage.from(RESOURCE_BUCKET).upload(storagePath, input.file, {
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
  return useMutation({
    mutationFn: async (resource: { id: string; storage_path: string | null }) => {
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

/** Private files are only ever reachable through a short-lived signed link. */
export async function openStoredFile(path: string) {
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

export function useAssignments(params?: { studentId?: string }) {
  const { data: tutor } = useTutorRecord();
  return useQuery({
    queryKey: ["tutor-assignments", tutor?.id, params?.studentId ?? null],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
      let query = supabase
        .from("assignments")
        .select("*, students(first_name, avatar_url), subjects(name), learning_resources(title)")
        .eq("tutor_id", tutor!.id)
        .order("created_at", { ascending: false });
      if (params?.studentId) query = query.eq("student_id", params.studentId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type AssignmentRow = NonNullable<ReturnType<typeof useAssignments>["data"]>[number];

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { data: tutor } = useTutorRecord();
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

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      patch: Database["public"]["Tables"]["assignments"]["Update"];
    }) => {
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

export function useEarningsSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-earnings-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_earnings_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export type EarningsSummary = NonNullable<ReturnType<typeof useEarningsSummary>["data"]>;

export function useEarningsRecords(limit = 50) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-earnings-records", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_earnings_records", { p_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type EarningsRecord = NonNullable<ReturnType<typeof useEarningsRecords>["data"]>[number];

export function usePayouts() {
  const { data: tutor } = useTutorRecord();
  return useQuery({
    queryKey: ["tutor-payouts", tutor?.id],
    enabled: Boolean(tutor?.id),
    queryFn: async () => {
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

export type PayoutRow = NonNullable<ReturnType<typeof usePayouts>["data"]>[number];

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
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

export function useRatingSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-rating-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_rating_summary");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useRatingCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-rating-categories", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_rating_categories");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTutorReviews(limit = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tutor-reviews", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("tutor_reviews", { p_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Messaging                                                           */
/* ------------------------------------------------------------------ */

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_conversations");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type ConversationRow = NonNullable<ReturnType<typeof useConversations>["data"]>[number];

export function useMessages(conversationId: string | undefined, limit = 100) {
  return useQuery({
    queryKey: ["messages", conversationId, limit],
    enabled: Boolean(conversationId),
    queryFn: async () => {
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

export type MessageRow = NonNullable<ReturnType<typeof useMessages>["data"]>[number];

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId || !user?.id) throw new Error("Conversation is not ready yet.");
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
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) return;
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
  return useMutation({
    mutationFn: async (input: { studentId: string; subject?: string }) => {
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
