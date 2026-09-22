import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";

export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

const STUDENT_RECORD_SELECT = "*, curricula(name), education_levels(name)";

export function useStudentRecord() {
  const { user, profile, roles, loading } = useAuth();

  return useQuery({
    queryKey: ["student-record", user?.id],
    enabled: Boolean(user?.id) && !loading,
    queryFn: async () => {
      const existing = await supabase
        .from("students")
        .select(STUDENT_RECORD_SELECT)
        .eq("profile_id", user!.id)
        .maybeSingle();

      if (existing.error) throw existing.error;
      if (existing.data) return existing.data as StudentRow;

      // A student who signs up with their own login (role "student") has a
      // profile + user_role from the signup trigger, but no students row yet
      // — the trigger only provisions profiles/user_roles. Create it here on
      // first visit, the same way useTutorRecord provisions a tutor row via
      // ensure_tutor_record(). Parent-created children already have a row
      // (parent_id set) and never reach this branch.
      if (!roles.includes("student")) return null;

      const fullName = (profile?.full_name ?? "").trim();
      const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);

      const created = await supabase
        .from("students")
        .insert({
          profile_id: user!.id,
          first_name: firstName || "Student",
          last_name: rest.length ? rest.join(" ") : null,
          timezone: profile?.timezone || "UTC",
          can_self_login: true,
        })
        .select(STUDENT_RECORD_SELECT)
        .maybeSingle();

      if (created.error) throw created.error;
      return (created.data ?? null) as StudentRow | null;
    },
  });
}

export function useStudentBookings(params?: {
  from?: string;
  to?: string;
  statuses?: BookingStatus[];
}) {
  const { data: student } = useStudentRecord();

  return useQuery({
    queryKey: ["student-bookings", student?.id, params?.from, params?.to, params?.statuses],
    enabled: Boolean(student?.id),
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(
          "id, student_id, tutor_id, subject_id, starts_at, ends_at, duration_minutes, status, total_amount, currency, tutor_accepted_at, tutors(id, profiles(full_name, avatar_url)), subjects(name), class_sessions(id, meeting_url, status, tutor_notes, homework), payments(status)",
        )
        .eq("student_id", student!.id)
        .order("starts_at", { ascending: false });

      if (params?.from) query = query.gte("starts_at", params.from);
      if (params?.to) query = query.lte("starts_at", params.to);
      if (params?.statuses && params.statuses.length > 0) {
        query = query.in("status", params.statuses);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStudentAssignments(status?: AssignmentStatus) {
  const { data: student } = useStudentRecord();

  return useQuery({
    queryKey: ["student-assignments", student?.id, status],
    enabled: Boolean(student?.id),
    queryFn: async () => {
      let query = supabase
        .from("assignments")
        .select("*, tutors(id, profiles(full_name, avatar_url)), subjects(name)")
        .eq("student_id", student!.id)
        .order("due_at", { ascending: true });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStudentMaterials() {
  const { data: student } = useStudentRecord();

  return useQuery({
    queryKey: ["student-materials", student?.id],
    enabled: Boolean(student?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*, tutors(id, profiles(full_name))")
        .or(`student_id.eq.${student!.id},is_shared.eq.true`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  const { data: student } = useStudentRecord();

  return useMutation({
    mutationFn: async ({ id, text, path }: { id: string; text?: string; path?: string }) => {
      if (!student) throw new Error("Not a student");
      const { error } = await supabase
        .from("assignments")
        .update({
          status: "submitted",
          submission_text: text || null,
          submission_path: path || null,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("student_id", student.id);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
    },
  });
}

export function useStudentNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, read_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      bookingId,
      tutorId,
      score,
      comment,
    }: {
      bookingId: string;
      tutorId: string;
      score: number;
      comment?: string;
    }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("ratings").insert({
        booking_id: bookingId,
        tutor_id: tutorId,
        rater_id: user.id,
        score,
        comment: comment || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
    },
  });
}

export function formatTimeInZone(iso: string | null | undefined, tz: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz || undefined,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleTimeString();
  }
}
