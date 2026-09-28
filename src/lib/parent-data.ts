import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { apiGet, apiPost, useApiData } from "@/lib/api/data-client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";

/**
 * Read layer for the authenticated Parent Portal.
 *
 * Every number, price, status and policy here comes from the database or from
 * admin-configured settings. Nothing is derived or hardcoded in the frontend
 * beyond display formatting.
 */

export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type VerificationStatus = Database["public"]["Enums"]["verification_status"];

export type TutorCard = Database["public"]["Functions"]["public_tutor_cards"]["Returns"][number];
export type ParentSummary =
  Database["public"]["Functions"]["parent_dashboard_summary"]["Returns"][number];
export type ChildProgressRow =
  Database["public"]["Functions"]["parent_child_progress"]["Returns"][number];
export type AvailabilitySlot =
  Database["public"]["Functions"]["tutor_available_slots"]["Returns"][number];
export type BookingQuote = Database["public"]["Functions"]["booking_quote"]["Returns"][number];

/* ------------------------------------------------------------------ */
/* Children                                                            */
/* ------------------------------------------------------------------ */

export function useChildren() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-children", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (viaApi) {
        const res = await apiGet<{ data: ApiChild[] }>("/parents/me/children?limit=100");
        return res.data.map(toChildShape) as unknown as Child[];
      }
      return fetchChildrenSupabase();
    },
  });
}

async function fetchChildrenSupabase() {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, first_name, last_name, date_of_birth, gender, avatar_url, school_name, learning_goals, special_needs, timezone, curriculum_id, education_level_id, can_self_login, can_book_lessons, can_message_tutors, is_active, created_at, curricula(name), education_levels(name)",
    )
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export type Child = NonNullable<Awaited<ReturnType<typeof fetchChildrenSupabase>>>[number];

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

const BOOKING_SELECT =
  "id, student_id, tutor_id, booked_by, subject_id, starts_at, ends_at, duration_minutes, booking_timezone, hourly_rate, currency, total_amount, status, student_notes, cancellation_policy_id, cancelled_at, cancellation_reason, created_at, subjects(name), education_levels(name), class_sessions(id, meeting_url, status, started_at, ended_at, student_attended, tutor_attended, tutor_notes, homework), payments(status)";

/** True once at least one payment on the booking has actually succeeded —
 * used to decide whether to show "Pay now" (pay_for_booking() also rejects
 * a second payment, but checking here avoids the round trip and the "already
 * paid" toast in the common case). */
export function isBookingPaid(booking: Pick<Booking, "payments">) {
  return (booking.payments ?? []).some((payment) => payment.status === "paid");
}

export function useBookings(options?: { studentId?: string | undefined }) {
  const { user } = useAuth();
  const viaApi = useApiData();
  const studentId = options?.studentId;
  return useQuery({
    queryKey: ["parent-bookings", user?.id, studentId ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (viaApi) {
        const qs = new URLSearchParams({ limit: "100" });
        if (studentId) qs.set("studentId", studentId);
        const res = await apiGet<{ data: ApiBooking[] }>(`/bookings?${qs.toString()}`);
        return res.data.map(toBookingShape) as unknown as Booking[];
      }
      return fetchBookingsSupabase(studentId);
    },
  });
}

async function fetchBookingsSupabase(studentId?: string) {
  let query = supabase.from("bookings").select(BOOKING_SELECT).order("starts_at", {
    ascending: false,
  });
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export type Booking = NonNullable<Awaited<ReturnType<typeof fetchBookingsSupabase>>>[number];

/** Resolves display info for a set of tutor ids through a backend function. */
export function useTutorCards(ids: (string | null | undefined)[]) {
  const viaApi = useApiData();
  const unique = useMemo(
    () => [...new Set(ids.filter((id): id is string => Boolean(id)))].sort(),
    [ids],
  );
  const query = useQuery({
    queryKey: ["tutor-cards", unique],
    enabled: unique.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (viaApi) return apiPost<TutorCard[]>("/catalogue/tutors/cards", { ids: unique });
      const { data, error } = await supabase.rpc("public_tutor_cards", { p_ids: unique });
      if (error) throw error;
      return data ?? [];
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-summary", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (viaApi) return apiGet<ParentSummary | null>("/parents/me/dashboard").catch(() => null);
      const { data, error } = await supabase.rpc("parent_dashboard_summary");
      if (error) throw error;
      return (data?.[0] ?? null) as ParentSummary | null;
    },
  });
}

export function useChildProgress(studentId: string | undefined) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-child-progress", studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      if (viaApi) return apiGet<ChildProgressRow[]>(`/students/${studentId}/progress`);
      const { data, error } = await supabase.rpc("parent_child_progress", {
        p_student_id: studentId!,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Payments, notifications, ratings                                    */
/* ------------------------------------------------------------------ */

export function usePayments() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-payments", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (viaApi) {
        const res = await apiGet<{ data: unknown[] }>("/payments?limit=100");
        return res.data as unknown as Payment[];
      }
      return fetchPaymentsSupabase();
    },
  });
}

async function fetchPaymentsSupabase() {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, booking_id, tutor_id, amount, currency, platform_fee, commission_amount, exchange_rate, status, provider, provider_reference, paid_at, refunded_amount, created_at, bookings(starts_at, duration_minutes, student_id, subject_id, subjects(name), students(first_name, last_name))",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type Payment = NonNullable<Awaited<ReturnType<typeof fetchPaymentsSupabase>>>[number];

export function useNotifications() {
  const { user } = useAuth();
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (viaApi) {
        const res = await apiGet<{ data: ApiNotification[] }>("/notifications?limit=100");
        return res.data.map(toNotificationShape) as unknown as ParentNotification[];
      }
      return fetchNotificationsSupabase();
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["parent-ratings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<MyRating[]> => {
      if (viaApi) {
        const rows = await apiGet<MyRating[]>("/bookings/my-ratings");
        return rows.map((r) => ({ ...r, score: Number(r.score) }));
      }
      const { data, error } = await supabase
        .from("ratings")
        .select("id, booking_id, tutor_id, score, comment, created_at")
        .eq("rater_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Configuration lookups                                               */
/* ------------------------------------------------------------------ */

export function useCurriculaOptions() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["config-curricula"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; country_code: string | null }[]> => {
      if (viaApi) {
        // Active curricula, already in sort order.
        const rows =
          await apiGet<{ id: string; name: string; country_code: string | null }[]>(
            "/catalogue/curricula",
          );
        return rows.map(({ id, name, country_code }) => ({ id, name, country_code }));
      }
      const { data, error } = await supabase
        .from("curricula")
        .select("id, name, country_code")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLevelOptions(curriculumId?: string | undefined) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["config-levels", curriculumId ?? "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; curriculum_id: string | null }[]> => {
      if (viaApi) {
        const rows = await apiGet<{ id: string; name: string; curriculum_id: string | null }[]>(
          "/catalogue/education-levels",
        );
        return rows
          .filter((row) => !curriculumId || row.curriculum_id === curriculumId)
          .map(({ id, name, curriculum_id }) => ({ id, name, curriculum_id }));
      }
      let query = supabase
        .from("education_levels")
        .select("id, name, curriculum_id")
        .eq("is_active", true)
        .order("sort_order");
      if (curriculumId) query = query.eq("curriculum_id", curriculumId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubjectOptions() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["config-subjects"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ id: string; name: string; category: string | null }[]> => {
      if (viaApi) {
        const rows =
          await apiGet<{ id: string; name: string; category: string | null }[]>(
            "/catalogue/subjects",
          );
        return rows.map(({ id, name, category }) => ({ id, name, category }));
      }
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, category")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["tutor-subjects", tutorId],
    enabled: Boolean(tutorId),
    queryFn: async (): Promise<TutorSubjectOption[]> => {
      if (viaApi) {
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
      }
      const { data, error } = await supabase
        .from("tutor_subjects")
        .select("subject_id, education_level_id, subjects(name), education_levels(name)")
        .eq("tutor_id", tutorId!);
      if (error) throw error;
      return data ?? [];
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
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["cancellation-policy", policyId ?? "default"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CancellationPolicy | null> => {
      if (viaApi) {
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
      }
      let query = supabase
        .from("cancellation_policies")
        .select("id, name, hours_before, refund_percentage, description")
        .eq("is_active", true);
      query = policyId ? query.eq("id", policyId) : query.eq("is_default", true);
      const { data, error } = await query.limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

/** Lesson duration options come from admin settings, never from a hardcoded list. */
export function useDurationOptions() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["config-durations"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<number[]> => {
      if (viaApi) {
        // Your database keeps these under booking.allowed_durations, the key
        // the API validates bookings against; the Supabase path read an older
        // key that does not exist there.
        const settings = await apiGet<Record<string, unknown>>("/catalogue/settings");
        const value = settings["booking.allowed_durations"];
        return Array.isArray(value)
          ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
          : [];
      }
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "booking.duration_options")
        .maybeSingle();
      if (error) throw error;
      const value = data?.value;
      if (Array.isArray(value)) {
        return value
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item) && item > 0);
      }
      return [];
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
  const viaApi = useApiData();
  const { tutorId, days = 21, durationMinutes } = params;
  return useQuery({
    queryKey: ["tutor-slots", tutorId, days, durationMinutes ?? null],
    enabled: Boolean(tutorId) && params.enabled !== false && Boolean(durationMinutes),
    staleTime: 30 * 1000,
    queryFn: async () => {
      if (viaApi) {
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
      }
      const { data, error } = await supabase.rpc("tutor_available_slots", {
        p_tutor_id: tutorId!,
        p_days: days,
        p_duration_minutes: durationMinutes!,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBookingQuote(tutorId: string | undefined, durationMinutes: number | undefined) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["booking-quote", tutorId, durationMinutes],
    enabled: Boolean(tutorId) && Boolean(durationMinutes),
    queryFn: async () => {
      if (viaApi) {
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
      }
      const { data, error } = await supabase.rpc("booking_quote", {
        p_tutor_id: tutorId!,
        p_duration_minutes: durationMinutes!,
      });
      if (error) throw error;
      return (data?.[0] ?? null) as BookingQuote | null;
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

async function fetchNotificationsSupabase() {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, trigger_key, channel, title, body, data, link, read_at, sent_at, created_at, notification_templates(trigger_key, description)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export type ParentNotification = NonNullable<
  Awaited<ReturnType<typeof fetchNotificationsSupabase>>
>[number];

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
      b.sessionMeetingUrl || b.sessionStatus
        ? [{ meeting_url: b.sessionMeetingUrl, status: b.sessionStatus }]
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
