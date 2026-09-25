import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { apiGet, apiPost, useApiData } from "@/lib/api/data-client";

type Tables = Database["public"]["Tables"];

export type StudentRow = Tables["students"]["Row"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

const STUDENT_RECORD_SELECT = "*, curricula(name), education_levels(name)";

type TutorRef = {
  id: string;
  profiles: { full_name: string | null; avatar_url?: string | null } | null;
};

export type StudentBooking = Pick<
  Tables["bookings"]["Row"],
  | "id"
  | "student_id"
  | "tutor_id"
  | "subject_id"
  | "starts_at"
  | "ends_at"
  | "duration_minutes"
  | "status"
  | "total_amount"
  | "currency"
  | "tutor_accepted_at"
> & {
  tutors: TutorRef | null;
  subjects: { name: string } | null;
  class_sessions: Pick<
    Tables["class_sessions"]["Row"],
    "id" | "meeting_url" | "status" | "tutor_notes" | "homework"
  >[];
  payments: { status: Database["public"]["Enums"]["payment_status"] }[];
};

export type StudentAssignment = Tables["assignments"]["Row"] & {
  tutors: TutorRef | null;
  subjects: { name: string } | null;
};

export type StudentMaterial = Tables["learning_resources"]["Row"] & {
  tutors: TutorRef | null;
};

export type StudentNotification = Pick<
  Tables["notifications"]["Row"],
  "id" | "title" | "body" | "created_at" | "read_at"
>;

/* ------------------------------------------------------------------ */
/* API shapes (camelCase) and adapters back to the portal's shapes     */
/* ------------------------------------------------------------------ */

interface ApiStudent {
  id: string;
  profileId: string | null;
  parentId: string | null;
  firstName: string;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  curriculumId: string | null;
  curriculumName: string | null;
  educationLevelId: string | null;
  educationLevelName: string | null;
  schoolName: string | null;
  learningGoals: string | null;
  specialNeeds: string | null;
  timezone: string;
  avatarUrl: string | null;
  canSelfLogin: boolean;
  canBookLessons: boolean;
  canMessageTutors: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ApiBooking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: BookingStatus;
  totalAmount: string;
  currency: string;
  tutorAcceptedAt: string | null;
  subjectName: string | null;
  paid: boolean;
  sessionId: string | null;
  sessionMeetingUrl: string | null;
  sessionStatus: Tables["class_sessions"]["Row"]["status"] | null;
  sessionTutorNotes: string | null;
  sessionHomework: string | null;
  tutorName: string | null;
  tutorAvatarUrl: string | null;
}

interface ApiAssignment {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string | null;
  bookingId: string | null;
  subjectId: string | null;
  subjectName: string | null;
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

interface ApiResource {
  id: string;
  title: string;
  description: string | null;
  resourceType: Tables["learning_resources"]["Row"]["resource_type"];
  externalUrl: string | null;
  hasFile: boolean;
  subjectId: string | null;
  studentId: string | null;
  isShared: boolean;
  tutorId: string;
  tutorName: string | null;
  createdAt: string;
}

interface ApiNotification {
  id: string;
  subject: string | null;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

function tutorRef(id: string, name: string | null, avatarUrl?: string | null): TutorRef {
  return { id, profiles: { full_name: name, avatar_url: avatarUrl ?? null } };
}

function toStudentRow(s: ApiStudent): StudentRow {
  return {
    id: s.id,
    profile_id: s.profileId,
    parent_id: s.parentId,
    first_name: s.firstName,
    last_name: s.lastName,
    date_of_birth: s.dateOfBirth,
    gender: s.gender,
    curriculum_id: s.curriculumId,
    education_level_id: s.educationLevelId,
    school_name: s.schoolName,
    learning_goals: s.learningGoals,
    special_needs: s.specialNeeds,
    timezone: s.timezone,
    avatar_url: s.avatarUrl,
    can_self_login: s.canSelfLogin,
    can_book_lessons: s.canBookLessons,
    can_message_tutors: s.canMessageTutors,
    is_active: s.isActive,
    created_at: s.createdAt,
    updated_at: s.createdAt,
    // The joined names the Supabase select adds.
    curricula: s.curriculumName ? { name: s.curriculumName } : null,
    education_levels: s.educationLevelName ? { name: s.educationLevelName } : null,
  } as StudentRow;
}

function toStudentBooking(b: ApiBooking): StudentBooking {
  return {
    id: b.id,
    student_id: b.studentId,
    tutor_id: b.tutorId,
    subject_id: b.subjectId,
    starts_at: b.startsAt,
    ends_at: b.endsAt,
    duration_minutes: b.durationMinutes,
    status: b.status,
    total_amount: Number(b.totalAmount),
    currency: b.currency,
    tutor_accepted_at: b.tutorAcceptedAt,
    tutors: tutorRef(b.tutorId, b.tutorName, b.tutorAvatarUrl),
    subjects: b.subjectName ? { name: b.subjectName } : null,
    class_sessions: b.sessionId
      ? [
          {
            id: b.sessionId,
            meeting_url: b.sessionMeetingUrl,
            status: b.sessionStatus!,
            tutor_notes: b.sessionTutorNotes,
            homework: b.sessionHomework,
          },
        ]
      : [],
    payments: b.paid ? [{ status: "paid" }] : [],
  };
}

function toStudentAssignment(a: ApiAssignment): StudentAssignment {
  return {
    id: a.id,
    tutor_id: a.tutorId,
    student_id: a.studentId,
    booking_id: a.bookingId,
    subject_id: a.subjectId,
    title: a.title,
    instructions: a.instructions,
    submission_requirements: a.submissionRequirements,
    due_at: a.dueAt,
    resource_id: null,
    status: a.status,
    assigned_at: null,
    submission_text: a.submissionText,
    // Storage keys are not exposed by the API.
    submission_path: null,
    submitted_at: a.submittedAt,
    feedback: a.feedback,
    reviewed_at: a.reviewedAt,
    created_at: a.createdAt,
    updated_at: a.createdAt,
    tutors: tutorRef(a.tutorId, a.tutorName),
    subjects: a.subjectName ? { name: a.subjectName } : null,
  };
}

function toStudentMaterial(r: ApiResource): StudentMaterial {
  return {
    id: r.id,
    tutor_id: r.tutorId,
    title: r.title,
    description: r.description,
    resource_type: r.resourceType,
    external_url: r.externalUrl,
    // File downloads need the storage provider; links still work.
    storage_path: null,
    mime_type: null,
    size_bytes: null,
    subject_id: r.subjectId,
    student_id: r.studentId,
    is_shared: r.isShared,
    created_at: r.createdAt,
    updated_at: r.createdAt,
    tutors: tutorRef(r.tutorId, r.tutorName),
  };
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useStudentRecord() {
  const { user, profile, roles, loading } = useAuth();
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["student-record", user?.id],
    enabled: Boolean(user?.id) && !loading,
    queryFn: async (): Promise<StudentRow | null> => {
      if (viaApi) {
        // Creates the record on first visit for a self-registered student;
        // 404 means the caller has no learner record (and is not a student).
        try {
          return toStudentRow(await apiGet<ApiStudent>("/students/me"));
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }
      }

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
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["student-bookings", student?.id, params?.from, params?.to, params?.statuses],
    enabled: Boolean(student?.id),
    queryFn: async (): Promise<StudentBooking[]> => {
      if (viaApi) {
        // The list is scoped by the database to what the caller may see; for
        // a student that is their own lessons. Status sets are filtered here
        // because the list endpoint takes a single status.
        const search = new URLSearchParams({ limit: "100" });
        if (params?.from) search.set("from", params.from);
        if (params?.to) search.set("to", params.to);
        const page = await apiGet<{ data: ApiBooking[] }>(`/bookings?${search.toString()}`);
        const statuses = params?.statuses?.length ? new Set(params.statuses) : null;
        return page.data
          .filter((b) => b.studentId === student!.id)
          .filter((b) => !statuses || statuses.has(b.status))
          .map(toStudentBooking);
      }

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
      return (data ?? []) as unknown as StudentBooking[];
    },
  });
}

export function useStudentAssignments(status?: AssignmentStatus) {
  const { data: student } = useStudentRecord();
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["student-assignments", student?.id, status],
    enabled: Boolean(student?.id),
    queryFn: async (): Promise<StudentAssignment[]> => {
      if (viaApi) {
        const search = new URLSearchParams({ studentId: student!.id, limit: "100" });
        if (status) search.set("status", status);
        const page = await apiGet<{ data: ApiAssignment[] }>(`/assignments?${search.toString()}`);
        // Due soonest first, undated last — the order the Supabase path used.
        return page.data
          .map(toStudentAssignment)
          .sort((a, b) =>
            a.due_at === b.due_at
              ? 0
              : a.due_at === null
                ? 1
                : b.due_at === null
                  ? -1
                  : a.due_at.localeCompare(b.due_at),
          );
      }

      let query = supabase
        .from("assignments")
        .select("*, tutors(id, profiles(full_name, avatar_url)), subjects(name)")
        .eq("student_id", student!.id)
        .order("due_at", { ascending: true });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as StudentAssignment[];
    },
  });
}

export function useStudentMaterials() {
  const { data: student } = useStudentRecord();
  const viaApi = useApiData();

  return useQuery({
    queryKey: ["student-materials", student?.id],
    enabled: Boolean(student?.id),
    queryFn: async (): Promise<StudentMaterial[]> => {
      if (viaApi) {
        // No studentId filter: the database returns this student's own
        // resources plus shared ones, which is what the page lists.
        const page = await apiGet<{ data: ApiResource[] }>("/learning-resources?limit=100");
        return page.data
          .filter((r) => r.studentId === student!.id || r.isShared)
          .map(toStudentMaterial);
      }

      const { data, error } = await supabase
        .from("learning_resources")
        .select("*, tutors(id, profiles(full_name))")
        .or(`student_id.eq.${student!.id},is_shared.eq.true`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as StudentMaterial[];
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  const { data: student } = useStudentRecord();
  const viaApi = useApiData();

  return useMutation({
    mutationFn: async ({ id, text, path }: { id: string; text?: string; path?: string }) => {
      if (!student) throw new Error("Not a student");
      if (viaApi) {
        await apiPost(`/assignments/${id}/submit`, {
          ...(text ? { submissionText: text } : {}),
          ...(path ? { submissionPath: path } : {}),
        });
        return;
      }
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["student-notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<StudentNotification[]> => {
      if (viaApi) {
        const page = await apiGet<{ data: ApiNotification[] }>("/notifications?limit=50");
        return page.data.map((n) => ({
          id: n.id,
          title: n.subject ?? "",
          body: n.body ?? "",
          created_at: n.createdAt,
          read_at: n.readAt,
        }));
      }
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

export function useMarkAllStudentNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      if (viaApi) {
        await apiPost("/notifications/read-all", {});
        return;
      }
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const viaApi = useApiData();

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
      comment?: string | undefined;
    }) => {
      if (!user) throw new Error("Not signed in");
      if (viaApi) {
        // The server takes the tutor from the booking, not from the request.
        await apiPost(`/bookings/${bookingId}/rating`, {
          score,
          ...(comment ? { comment } : {}),
        });
        return;
      }
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

/**
 * Requests a lesson. Under the API the server prices it from booking_quote()
 * and fills the money fields itself; the client sends only what the student
 * chose.
 */
export function useCreateStudentBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: student } = useStudentRecord();
  const viaApi = useApiData();

  return useMutation({
    mutationFn: async (input: {
      tutorId: string;
      subjectId: string | null;
      startsAt: string;
      endsAt: string;
      timezone: string;
      notes: string | null;
      quote: {
        duration_minutes: number;
        hourly_rate: number;
        currency: string;
        total_amount: number;
        commission_rule_id?: string | null;
        cancellation_policy_id?: string | null;
      };
    }) => {
      if (!user || !student) throw new Error("You need to be signed in.");
      if (viaApi) {
        await apiPost("/bookings", {
          studentId: student.id,
          tutorId: input.tutorId,
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
          ...(student.education_level_id ? { educationLevelId: student.education_level_id } : {}),
          startsAt: input.startsAt,
          durationMinutes: input.quote.duration_minutes,
          timezone: input.timezone,
          ...(input.notes ? { studentNotes: input.notes } : {}),
        });
        return;
      }
      const { error } = await supabase.from("bookings").insert({
        student_id: student.id,
        tutor_id: input.tutorId,
        booked_by: user.id,
        subject_id: input.subjectId,
        education_level_id: student.education_level_id ?? null,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        duration_minutes: input.quote.duration_minutes,
        booking_timezone: input.timezone,
        hourly_rate: input.quote.hourly_rate,
        currency: input.quote.currency,
        total_amount: input.quote.total_amount,
        commission_rule_id: input.quote.commission_rule_id ?? null,
        cancellation_policy_id: input.quote.cancellation_policy_id ?? null,
        student_notes: input.notes,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["tutor-slots"] });
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
