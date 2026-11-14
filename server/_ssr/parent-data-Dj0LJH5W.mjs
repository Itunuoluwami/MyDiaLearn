import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { a as apiPost, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parent-data-Dj0LJH5W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useChildren() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["parent-children", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/parents/me/children?limit=100")).data.map(toChildShape);
		}
	});
}
function childName(child) {
	if (!child) return "";
	return [child.first_name, child.last_name].filter(Boolean).join(" ");
}
function childInitials(child) {
	if (!child) return "?";
	return `${child.first_name?.[0] ?? ""}${child.last_name?.[0] ?? ""}`.toUpperCase() || "?";
}
/** True once at least one payment on the booking has actually succeeded —
* used to decide whether to show "Pay now" (pay_for_booking() also rejects
* a second payment, but checking here avoids the round trip and the "already
* paid" toast in the common case). */
function isBookingPaid(booking) {
	return (booking.payments ?? []).some((payment) => payment.status === "paid");
}
function useBookings(options) {
	const { user } = useAuth();
	const studentId = options?.studentId;
	return useQuery({
		queryKey: [
			"parent-bookings",
			user?.id,
			studentId ?? "all"
		],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const qs = new URLSearchParams({ limit: "100" });
			if (studentId) qs.set("studentId", studentId);
			return (await apiGet(`/bookings?${qs.toString()}`)).data.map(toBookingShape);
		}
	});
}
/** Resolves display info for a set of tutor ids through a backend function. */
function useTutorCards(ids) {
	const unique = (0, import_react.useMemo)(() => [...new Set(ids.filter((id) => Boolean(id)))].sort(), [ids]);
	const query = useQuery({
		queryKey: ["tutor-cards", unique],
		enabled: unique.length > 0,
		staleTime: 3e5,
		queryFn: async () => {
			return apiPost("/catalogue/tutors/cards", { ids: unique });
		}
	});
	const map = (0, import_react.useMemo)(() => {
		const result = /* @__PURE__ */ new Map();
		for (const row of query.data ?? []) result.set(row.id, row);
		return result;
	}, [query.data]);
	return {
		...query,
		map
	};
}
function useTutorCard(tutorId) {
	const { map, isLoading } = useTutorCards([tutorId]);
	return {
		tutor: tutorId ? map.get(tutorId) ?? null : null,
		isLoading
	};
}
function useParentSummary() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["parent-summary", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return apiGet("/parents/me/dashboard").catch(() => null);
		}
	});
}
function useChildProgress(studentId) {
	return useQuery({
		queryKey: ["parent-child-progress", studentId],
		enabled: Boolean(studentId),
		queryFn: async () => {
			return apiGet(`/students/${studentId}/progress`);
		}
	});
}
function toPayment(p) {
	return {
		id: p.id,
		booking_id: p.bookingId,
		amount: Number(p.amount ?? 0),
		currency: p.currency,
		status: p.status,
		platform_fee: Number(p.platformFee ?? 0),
		refunded_amount: Number(p.refundedAmount ?? 0),
		provider: p.provider,
		provider_reference: p.providerReference,
		paid_at: p.paidAt,
		created_at: p.createdAt
	};
}
function usePayments() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["parent-payments", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return ((await apiGet("/payments?limit=100")).data ?? []).map(toPayment);
		}
	});
}
function useNotifications() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["parent-notifications", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/notifications?limit=100")).data.map(toNotificationShape);
		}
	});
}
function useCurriculaOptions() {
	return useQuery({
		queryKey: ["config-curricula"],
		staleTime: 3e5,
		queryFn: async () => {
			return (await apiGet("/catalogue/curricula")).map(({ id, name, country_code }) => ({
				id,
				name,
				country_code
			}));
		}
	});
}
function useLevelOptions(curriculumId) {
	return useQuery({
		queryKey: ["config-levels", curriculumId ?? "all"],
		staleTime: 3e5,
		queryFn: async () => {
			return (await apiGet("/catalogue/education-levels")).filter((row) => !curriculumId || row.curriculum_id === curriculumId).map(({ id, name, curriculum_id }) => ({
				id,
				name,
				curriculum_id
			}));
		}
	});
}
function useSubjectOptions() {
	return useQuery({
		queryKey: ["config-subjects"],
		staleTime: 3e5,
		queryFn: async () => {
			return (await apiGet("/catalogue/subjects")).map(({ id, name, category }) => ({
				id,
				name,
				category
			}));
		}
	});
}
function useTutorSubjects(tutorId) {
	return useQuery({
		queryKey: ["tutor-subjects", tutorId],
		enabled: Boolean(tutorId),
		queryFn: async () => {
			return (await apiGet(`/catalogue/tutors/${tutorId}/subjects`)).map((r) => ({
				subject_id: r.subject_id,
				education_level_id: r.education_level_id,
				subjects: { name: r.subject_name },
				education_levels: r.level_name ? { name: r.level_name } : null
			}));
		}
	});
}
/** Lesson duration options come from admin settings, never from a hardcoded list. */
function useDurationOptions() {
	return useQuery({
		queryKey: ["config-durations"],
		staleTime: 3e5,
		queryFn: async () => {
			const value = (await apiGet("/catalogue/settings"))["booking.allowed_durations"];
			return Array.isArray(value) ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0) : [];
		}
	});
}
function useAvailableSlots(params) {
	const { tutorId, days = 21, durationMinutes } = params;
	return useQuery({
		queryKey: [
			"tutor-slots",
			tutorId,
			days,
			durationMinutes ?? null
		],
		enabled: Boolean(tutorId) && params.enabled !== false && Boolean(durationMinutes),
		staleTime: 3e4,
		queryFn: async () => {
			const qs = new URLSearchParams({
				tutorId: params.tutorId ?? "",
				durationMinutes: String(params.durationMinutes ?? 60),
				days: String(params.days ?? 14)
			});
			return (await apiGet(`/bookings/available-slots?${qs.toString()}`)).map((sl) => ({
				starts_at: sl.startsAt,
				ends_at: sl.endsAt
			}));
		}
	});
}
function useBookingQuote(tutorId, durationMinutes) {
	return useQuery({
		queryKey: [
			"booking-quote",
			tutorId,
			durationMinutes
		],
		enabled: Boolean(tutorId) && Boolean(durationMinutes),
		queryFn: async () => {
			const q = await apiPost("/payments/quote", {
				tutorId,
				durationMinutes
			});
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
				cancellation_policy_id: q.cancellationPolicyId
			};
		}
	});
}
function formatMoney(amount, currency) {
	if (amount === null || amount === void 0 || amount === "") return "—";
	const value = typeof amount === "string" ? Number(amount) : amount;
	if (!Number.isFinite(value)) return "—";
	try {
		return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency: currency || "USD",
			maximumFractionDigits: 2
		}).format(value);
	} catch {
		return `${currency ?? ""} ${value}`.trim();
	}
}
/** Formats a backend timestamp in a given IANA timezone. No offset maths here. */
function formatInZone(iso, timezone, options) {
	if (!iso) return "—";
	try {
		return new Intl.DateTimeFormat(void 0, {
			...options,
			timeZone: timezone || void 0
		}).format(new Date(iso));
	} catch {
		return new Date(iso).toLocaleString();
	}
}
function formatDayInZone(iso, tz) {
	return formatInZone(iso, tz, {
		weekday: "short",
		day: "numeric",
		month: "short"
	});
}
function formatTimeInZone(iso, tz) {
	return formatInZone(iso, tz, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function formatRelative(iso) {
	if (!iso) return "";
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.round(diff / 6e4);
	const rtf = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
	if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
	const hours = Math.round(minutes / 60);
	if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
	return rtf.format(-Math.round(hours / 24), "day");
}
function formatHoursFromMinutes(minutes) {
	if (!minutes) return "0h";
	const hours = minutes / 60;
	return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}
/** Timezone the portal displays times in: the parent's stored profile timezone. */
function useViewerTimezone() {
	const { profile } = useAuth();
	return profile?.timezone || "UTC";
}
var BOOKING_STATUS_LABEL = {
	pending: "Pending approval",
	confirmed: "Confirmed",
	in_progress: "Live now",
	completed: "Completed",
	cancelled: "Cancelled",
	rejected: "Declined",
	no_show: "No show"
};
var PAYMENT_STATUS_LABEL = {
	pending: "Pending",
	processing: "Processing",
	paid: "Paid",
	failed: "Failed",
	refunded: "Refunded",
	partially_refunded: "Partially refunded"
};
/** Minutes until a booking starts, using backend timestamps. */
function minutesUntil(iso) {
	if (!iso) return Number.POSITIVE_INFINITY;
	return Math.round((new Date(iso).getTime() - Date.now()) / 6e4);
}
function isJoinable(booking) {
	if (booking.status === "in_progress") return true;
	if (booking.status !== "confirmed") return false;
	const until = minutesUntil(booking.starts_at);
	const ended = new Date(booking.ends_at).getTime() < Date.now();
	return until <= 15 && !ended;
}
function toChildShape(c) {
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
		education_levels: c.educationLevelName ? { name: c.educationLevelName } : null
	};
}
function toBookingShape(b) {
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
		class_sessions: b.sessionMeetingUrl || b.sessionStatus || b.sessionId ? [{
			id: b.sessionId,
			meeting_url: b.sessionMeetingUrl,
			status: b.sessionStatus,
			tutor_notes: b.sessionTutorNotes,
			homework: b.sessionHomework
		}] : [],
		payments: b.paid ? [{ status: "paid" }] : []
	};
}
function toNotificationShape(n) {
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
		notification_templates: null
	};
}
//#endregion
export { usePayments as C, useTutorSubjects as D, useTutorCards as E, useViewerTimezone as O, useParentSummary as S, useTutorCard as T, useChildren as _, formatDayInZone as a, useLevelOptions as b, formatRelative as c, isJoinable as d, minutesUntil as f, useChildProgress as g, useBookings as h, childName as i, formatTimeInZone as l, useBookingQuote as m, PAYMENT_STATUS_LABEL as n, formatHoursFromMinutes as o, useAvailableSlots as p, childInitials as r, formatMoney as s, BOOKING_STATUS_LABEL as t, isBookingPaid as u, useCurriculaOptions as v, useSubjectOptions as w, useNotifications as x, useDurationOptions as y };
