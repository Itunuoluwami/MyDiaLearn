import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import type { AssignmentStatus, BookingStatus, PaymentStatus } from "@/lib/domain-types";
export type { AssignmentStatus, BookingStatus } from "@/lib/domain-types";
import { apiGet, apiPost } from "@/lib/api/data-client";

type Tables = Database["public"]["Tables"];

export type StudentRow = Tables["students"]["Row"];

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
  payments: { status: PaymentStatus }[];
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

  return useQuery({
    queryKey: ["student-record", user?.id],
    enabled: Boolean(user?.id) && !loading,
    queryFn: async (): Promise<StudentRow | null> => {
      // Creates the record on first visit for a self-registered student;
      // 404 means the caller has no learner record (and is not a student).
      try {
        return toStudentRow(await apiGet<ApiStudent>("/students/me"));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
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
    queryFn: async (): Promise<StudentBooking[]> => {
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
    },
  });
}

export function useStudentAssignments(status?: AssignmentStatus) {
  const { data: student } = useStudentRecord();

  return useQuery({
    queryKey: ["student-assignments", student?.id, status],
    enabled: Boolean(student?.id),
    queryFn: async (): Promise<StudentAssignment[]> => {
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
    },
  });
}

export function useStudentMaterials() {
  const { data: student } = useStudentRecord();

  return useQuery({
    queryKey: ["student-materials", student?.id],
    enabled: Boolean(student?.id),
    queryFn: async (): Promise<StudentMaterial[]> => {
      // No studentId filter: the database returns this student's own
      // resources plus shared ones, which is what the page lists.
      const page = await apiGet<{ data: ApiResource[] }>("/learning-resources?limit=100");
      return page.data
        .filter((r) => r.studentId === student!.id || r.isShared)
        .map(toStudentMaterial);
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  const { data: student } = useStudentRecord();

  return useMutation({
    mutationFn: async ({ id, text, path }: { id: string; text?: string; path?: string }) => {
      if (!student) throw new Error("Not a student");
      await apiPost(`/assignments/${id}/submit`, {
        ...(text ? { submissionText: text } : {}),
        ...(path ? { submissionPath: path } : {}),
      });
      return;
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
    queryFn: async (): Promise<StudentNotification[]> => {
      const page = await apiGet<{ data: ApiNotification[] }>("/notifications?limit=50");
      return page.data.map((n) => ({
        id: n.id,
        title: n.subject ?? "",
        body: n.body ?? "",
        created_at: n.createdAt,
        read_at: n.readAt,
      }));
    },
  });
}

export function useMarkAllStudentNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await apiPost("/notifications/read-all", {});
      return;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
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
      comment?: string | undefined;
    }) => {
      if (!user) throw new Error("Not signed in");
      // The server takes the tutor from the booking, not from the request.
      await apiPost(`/bookings/${bookingId}/rating`, {
        score,
        ...(comment ? { comment } : {}),
      });
      return;
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
