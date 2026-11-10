import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiGet, apiPost } from "@/lib/api/data-client";
import type { BookingStatus, PaymentStatus, VerificationStatus } from "@/lib/domain-types";
import type {
  BookingQuoteResult,
  ParentChildProgressResult,
  ParentDashboardSummaryResult,
  PublicTutorCardsResult,
  TutorAvailableSlotsResult,
} from "@/lib/database-types";
export type { BookingStatus, PaymentStatus, VerificationStatus } from "@/lib/domain-types";
import { useAuth } from "@/hooks/use-auth";

/**
 * Read layer for the authenticated Parent Portal.
 *
 * Every number, price, status and policy here comes from the database or from
 * admin-configured settings. Nothing is derived or hardcoded in the frontend
 * beyond display formatting.
 */

export type TutorCard = PublicTutorCardsResult[number];
export type ParentSummary = ParentDashboardSummaryResult[number];
export type ChildProgressRow = ParentChildProgressResult[number];
export type AvailabilitySlot = TutorAvailableSlotsResult[number];
export type BookingQuote = BookingQuoteResult[number];

/* ------------------------------------------------------------------ */
/* Children                                                            */
/* ------------------------------------------------------------------ */

export function useChildren() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["parent-children", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const res = await apiGet<{ data: ApiChild[] }>("/parents/me/children?limit=100");
      return res.data.map(toChildShape) as unknown as Child[];
    },
  });
}

/** Mirrors the booking_status enum. Consumers switch on it exhaustively. */
export type ParentBookingStatus =
  "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected" | "no_show";

/** A learner, as the parent portal consumes it. Mirrors toChildShape(). */
export interface Child {
  id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  school_name: string | null;
  learning_goals: string | null;
  special_needs: string | null;
  timezone: string;
  curriculum_id: string | null;
  education_level_id: string | null;
  can_self_login: boolean;
  can_book_lessons: boolean;
  can_message_tutors: boolean;
  is_active: boolean;
  created_at: string;
  curricula: { name: string } | null;
  education_levels: { name: string } | null;
}

export function childName(child: Pick<Child, "first_name" | "last_name"> | null | undefined) {
  if (!child) return "";
  return [child.first_name, child.last_name].filter(Boolean).join(" ");
}

export function childInitials(child: Pick<Child, "first_name" | "last_name"> | null | undefined) {
  if (!child) return "?";
  return `${child.first_name?.[0] ?? ""}${child.last_name?.[0] ?? ""}`.toUpperCase() || "?";
}

/* ------------------------------------------------------------------ */
/* Bookings + class sessions                                           */
/* ------------------------------------------------------------------ */

/** True once at least one payment on the booking has actually succeeded —
 * used to decide whether to show "Pay now" (pay_for_booking() also rejects
 * a second payment, but checking here avoids the round trip and the "already
 * paid" toast in the common case). */
export function isBookingPaid(booking: Pick<Booking, "payments">) {
  return (booking.payments ?? []).some((payment) => payment.status === "paid");
}

export function useBookings(options?: { studentId?: string | undefined }) {
  const { user } = useAuth();
  const studentId = options?.studentId;
  return useQuery({
    queryKey: ["parent-bookings", user?.id, studentId ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: "100" });
      if (studentId) qs.set("studentId", studentId);
      const res = await apiGet<{ data: ApiBooking[] }>(`/bookings?${qs.toString()}`);
      return res.data.map(toBookingShape) as unknown as Booking[];
    },
  });
}

/** A booking, as the parent portal consumes it. Mirrors toBookingShape(). */
export interface Booking {
  id: string;
  student_id: string;
  tutor_id: string;
  booked_by: string;
  subject_id: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  booking_timezone: string;
  hourly_rate: number;
  currency: string;
  total_amount: number;
  status: ParentBookingStatus;
  student_notes: string | null;
  cancellation_policy_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  subjects: { name: string } | null;
  education_levels: { name: string } | null;
  class_sessions: {
    id: string | null;
    meeting_url: string | null;
    status: string | null;
    tutor_notes: string | null;
    homework: string | null;
  }[];
  payments: { status: string }[];
}

/** Resolves display info for a set of tutor ids through a backend function. */
export function useTutorCards(ids: (string | null | undefined)[]) {
  const unique = useMemo(
    () => [...new Set(ids.filter((id): id is string => Boolean(id)))].sort(),
    [ids],
  );
  const query = useQuery({
    queryKey: ["tutor-cards", unique],
    enabled: unique.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      return apiPost<TutorCard[]>("/catalogue/tutors/cards", { ids: unique });
    },
  });

  const map = useMemo(() => {
    const result = new Map<string, TutorCard>();
    for (const row of query.data ?? []) result.set(row.id, row);
    return result;
  }, [query.data]);

  return { ...query, map };
}

export function useTutorCard(tutorId: string | undefined) {
  const { map, isLoading } = useTutorCards([tutorId]);
  return { tutor: tutorId ? (map.get(tutorId) ?? null) : null, isLoading };
}

/* ------------------------------------------------------------------ */
/* KPIs and progress                                                   */
/* ------------------------------------------------------------------ */

export function useParentSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["parent-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      return apiGet<ParentSummary | null>("/parents/me/dashboard").catch(() => null);
    },
  });
}

export function useChildProgress(studentId: string | undefined) {
  return useQuery({
    queryKey: ["parent-child-progress", studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      return apiGet<ChildProgressRow[]>(`/students/${studentId}/progress`);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payments, notifications, ratings                                    */
/* ------------------------------------------------------------------ */

export function usePayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["parent-payments", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const res = await apiGet<{ data: unknown[] }>("/payments?limit=100");
      return res.data as unknown as Payment[];
    },
  });
}

/** A payment row as /payments returns it. */
export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["parent-notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const res = await apiGet<{ data: ApiNotification[] }>("/notifications?limit=100");
      return res.data.map(toNotificationShape) as unknown as ParentNotification[];
    },
  });
}

export type Notification = NonNullable<ReturnType<typeof useNotifications>["data"]>[number];

type MyRating = {
  id: string;
  booking_id: string | null;
  tutor_id: string;
  score: number;
  comment: string | null;
  created_at: string;
};

export function useMyRatings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["parent-ratings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<MyRating[]> => {
      const rows = await apiGet<MyRating[]>("/bookings/my-ratings");
      return rows.map((r) => ({ ...r, score: Number(r.score) }));
    },
  });
}

/* ------------------------------------------------------------------ */
/* Configuration lookups                                               */
/* ------------------------------------------------------------------ */

export function useCurriculaOptions() {
  return useQuery({
    queryKey: ["config-curricula"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; country_code: string | null }[]> => {
      // Active curricula, already in sort order.
      const rows =
        await apiGet<{ id: string; name: string; country_code: string | null }[]>(
          "/catalogue/curricula",
        );
      return rows.map(({ id, name, country_code }) => ({ id, name, country_code }));
    },
  });
}

export function useLevelOptions(curriculumId?: string | undefined) {
  return useQuery({
    queryKey: ["config-levels", curriculumId ?? "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; curriculum_id: string | null }[]> => {
      const rows = await apiGet<{ id: string; name: string; curriculum_id: string | null }[]>(
        "/catalogue/education-levels",
      );
      return rows
        .filter((row) => !curriculumId || row.curriculum_id === curriculumId)
        .map(({ id, name, curriculum_id }) => ({ id, name, curriculum_id }));
    },
  });
}

export function useSubjectOptions() {
  return useQuery({
    queryKey: ["config-subjects"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; category: string | null }[]> => {
      const rows =
        await apiGet<{ id: string; name: string; category: string | null }[]>(
          "/catalogue/subjects",
        );
      return rows.map(({ id, name, category }) => ({ id, name, category }));
    },
  });
}

type TutorSubjectOption = {
  subject_id: string;
  education_level_id: string | null;
  subjects: { name: string } | null;
  education_levels: { name: string } | null;
};

export function useTutorSubjects(tutorId: string | undefined) {
  return useQuery({
    queryKey: ["tutor-subjects", tutorId],
    enabled: Boolean(tutorId),
    queryFn: async (): Promise<TutorSubjectOption[]> => {
      const rows = await apiGet<
        {
          subject_id: string;
          education_level_id: string | null;
          subject_name: string;
          level_name: string | null;
        }[]
      >(`/catalogue/tutors/${tutorId}/subjects`);
      return rows.map((r) => ({
        subject_id: r.subject_id,
        education_level_id: r.education_level_id,
        subjects: { name: r.subject_name },
        education_levels: r.level_name ? { name: r.level_name } : null,
      }));
    },
  });
}

type CancellationPolicy = {
  id: string;
  name: string;
  hours_before: number;
  refund_percentage: number;
  description: string | null;
};

export function useCancellationPolicy(policyId?: string | null) {
  return useQuery({
    queryKey: ["cancellation-policy", policyId ?? "default"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CancellationPolicy | null> => {
      const rows = await apiGet<(CancellationPolicy & { is_default: boolean })[]>(
        "/catalogue/cancellation-policies",
      );
      const match = rows.find((row) => (policyId ? row.id === policyId : row.is_default));
      if (!match) return null;
      const { is_default: _isDefault, ...policy } = match;
      return {
        ...policy,
        hours_before: Number(policy.hours_before),
        refund_percentage: Number(policy.refund_percentage),
      };
    },
  });
}

/** Lesson duration options come from admin settings, never from a hardcoded list. */
export function useDurationOptions() {
  return useQuery({
    queryKey: ["config-durations"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<number[]> => {
      // Your database keeps these under booking.allowed_durations, the key
      // the API validates bookings against; the Supabase path read an older
      // key that does not exist there.
      const settings = await apiGet<Record<string, unknown>>("/catalogue/settings");
      const value = settings["booking.allowed_durations"];
      return Array.isArray(value)
        ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
        : [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Availability + quotes (backend is the source of truth)              */
/* ------------------------------------------------------------------ */

export function useAvailableSlots(params: {
  tutorId: string | undefined;
  days?: number;
  durationMinutes?: number | undefined;
  enabled?: boolean;
}) {
  const { tutorId, days = 21, durationMinutes } = params;
  return useQuery({
    queryKey: ["tutor-slots", tutorId, days, durationMinutes ?? null],
    enabled: Boolean(tutorId) && params.enabled !== false && Boolean(durationMinutes),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const qs = new URLSearchParams({
        tutorId: params.tutorId ?? "",
        durationMinutes: String(params.durationMinutes ?? 60),
        days: String(params.days ?? 14),
      });
      const slots = await apiGet<{ startsAt: string; endsAt: string }[]>(
        `/bookings/available-slots?${qs.toString()}`,
      );
      // Map to the snake_case shape the RPC returned.
      return slots.map((sl) => ({
        starts_at: sl.startsAt,
        ends_at: sl.endsAt,
      })) as unknown as AvailabilitySlot[];
    },
  });
}

export function useBookingQuote(tutorId: string | undefined, durationMinutes: number | undefined) {
  return useQuery({
    queryKey: ["booking-quote", tutorId, durationMinutes],
    enabled: Boolean(tutorId) && Boolean(durationMinutes),
    queryFn: async () => {
      const q = await apiPost<{
        currency: string;
        hourlyRate: string;
        durationMinutes: number;
        lessonAmount: string;
        platformFee: string;
        processingFee: string;
        commissionAmount: string;
        totalAmount: string;
        commissionRuleId: string | null;
        cancellationPolicyId: string | null;
      }>("/payments/quote", { tutorId: tutorId!, durationMinutes: durationMinutes! });
      // Map camelCase API fields to the snake_case RPC shape the UI reads.
      return {
        currency: q.currency,
        hourly_rate: Number(q.hourlyRate),
        duration_minutes: q.durationMinutes,
        lesson_amount: Number(q.lessonAmount),
        platform_fee: Number(q.platformFee),
        processing_fee: Number(q.processingFee),
        commission_amount: Number(q.commissionAmount),
        total_amount: Number(q.totalAmount),
        commission_rule_id: q.commissionRuleId,
        cancellation_policy_id: q.cancellationPolicyId,
      } as unknown as BookingQuote;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Display formatting helpers                                          */
/* ------------------------------------------------------------------ */

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
) {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency ?? ""} ${value}`.trim();
  }
}

/** Formats a backend timestamp in a given IANA timezone. No offset maths here. */
export function formatInZone(
  iso: string | null | undefined,
  timezone: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      ...options,
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function formatDayInZone(iso: string | null | undefined, tz: string | null | undefined) {
  return formatInZone(iso, tz, { weekday: "short", day: "numeric", month: "short" });
}

export function formatTimeInZone(iso: string | null | undefined, tz: string | null | undefined) {
  return formatInZone(iso, tz, { hour: "numeric", minute: "2-digit" });
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

export function formatHoursFromMinutes(minutes: number | null | undefined) {
  if (!minutes) return "0h";
  const hours = minutes / 60;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

/** Timezone the portal displays times in: the parent's stored profile timezone. */
export function useViewerTimezone() {
  const { profile } = useAuth();
  return profile?.timezone || "UTC";
}

/* ------------------------------------------------------------------ */
/* Booking status presentation (labels only — values stay backend-owned) */
/* ------------------------------------------------------------------ */

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending approval",
  confirmed: "Confirmed",
  in_progress: "Live now",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Declined",
  no_show: "No show",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

/** Minutes until a booking starts, using backend timestamps. */
export function minutesUntil(iso: string | null | undefined) {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}

export function isJoinable(booking: Pick<Booking, "starts_at" | "ends_at" | "status">) {
  if (booking.status === "in_progress") return true;
  if (booking.status !== "confirmed") return false;
  const until = minutesUntil(booking.starts_at);
  const ended = new Date(booking.ends_at).getTime() < Date.now();
  return until <= 15 && !ended;
}

/** A notification, as the parent portal consumes it. Mirrors toNotificationShape(). */
export interface ParentNotification {
  id: string;
  trigger_key: string | null;
  channel: string;
  title: string | null;
  body: string | null;
  data: unknown;
  link: string | null;
  read_at: string | null;
  sent_at: string;
  created_at: string;
  notification_templates: unknown;
}

/* ------------------------------------------------------------------ */
/* API response adapters                                               */
/*                                                                     */
/* The REST API returns flat camelCase; these map it back to the       */
/* snake_case / nested shape the components already consume, so no      */
/* screen changes when the data source switches. Typed loosely on      */
/* purpose — the cast at each call site is the real contract.          */
/* ------------------------------------------------------------------ */

interface ApiChild {
  id: string;
  firstName: string;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  avatarUrl: string | null;
  schoolName: string | null;
  learningGoals: string | null;
  specialNeeds: string | null;
  timezone: string;
  curriculumId: string | null;
  curriculumName: string | null;
  educationLevelId: string | null;
  educationLevelName: string | null;
  canSelfLogin: boolean;
  canBookLessons: boolean;
  canMessageTutors: boolean;
  isActive: boolean;
  createdAt: string;
}

function toChildShape(c: ApiChild): Record<string, unknown> {
  return {
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName,
    date_of_birth: c.dateOfBirth,
    gender: c.gender,
    avatar_url: c.avatarUrl,
    school_name: c.schoolName,
    learning_goals: c.learningGoals,
    special_needs: c.specialNeeds,
    timezone: c.timezone,
    curriculum_id: c.curriculumId,
    education_level_id: c.educationLevelId,
    can_self_login: c.canSelfLogin,
    can_book_lessons: c.canBookLessons,
    can_message_tutors: c.canMessageTutors,
    is_active: c.isActive,
    created_at: c.createdAt,
    curricula: c.curriculumName ? { name: c.curriculumName } : null,
    education_levels: c.educationLevelName ? { name: c.educationLevelName } : null,
  };
}

interface ApiBooking {
  id: string;
  studentId: string;
  tutorId: string;
  bookedBy: string;
  subjectId: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string;
  hourlyRate: string;
  currency: string;
  totalAmount: string;
  status: string;
  subjectName: string | null;
  paid: boolean;
  sessionMeetingUrl: string | null;
  sessionStatus: string | null;
  sessionId: string | null;
  sessionTutorNotes: string | null;
  sessionHomework: string | null;
  studentNotes: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

function toBookingShape(b: ApiBooking): Record<string, unknown> {
  return {
    id: b.id,
    student_id: b.studentId,
    tutor_id: b.tutorId,
    booked_by: b.bookedBy,
    subject_id: b.subjectId,
    starts_at: b.startsAt,
    ends_at: b.endsAt,
    duration_minutes: b.durationMinutes,
    booking_timezone: b.timezone,
    hourly_rate: Number(b.hourlyRate),
    currency: b.currency,
    total_amount: Number(b.totalAmount),
    status: b.status,
    student_notes: b.studentNotes,
    cancellation_policy_id: null,
    cancelled_at: b.cancelledAt,
    cancellation_reason: b.cancellationReason,
    created_at: b.createdAt,
    subjects: b.subjectName ? { name: b.subjectName } : null,
    education_levels: null,
    class_sessions:
      b.sessionMeetingUrl || b.sessionStatus || b.sessionId
        ? [
            {
              id: b.sessionId,
              meeting_url: b.sessionMeetingUrl,
              status: b.sessionStatus,
              tutor_notes: b.sessionTutorNotes,
              homework: b.sessionHomework,
            },
          ]
        : [],
    payments: b.paid ? [{ status: "paid" }] : [],
  };
}

interface ApiNotification {
  id: string;
  triggerKey: string | null;
  channel: string;
  subject: string | null;
  body: string | null;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

function toNotificationShape(n: ApiNotification): Record<string, unknown> {
  return {
    id: n.id,
    trigger_key: n.triggerKey,
    channel: n.channel,
    title: n.subject,
    body: n.body,
    data: null,
    link: n.link,
    read_at: n.readAt,
    sent_at: n.createdAt,
    created_at: n.createdAt,
    notification_templates: null,
  };
}
