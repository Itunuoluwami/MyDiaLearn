import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { a as apiPost, i as apiPatch, n as apiDelete, o as apiUpload, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-data-BgedrW1M.js
function toNumber(value) {
	return typeof value === "number" ? value : Number(value ?? 0);
}
function toTutorRow(t) {
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
		submitted_at: t.submittedAt
	};
}
/** snake_case Update → the API's camelCase PATCH body. Unknown keys are dropped. */
var UPDATE_FIELD_MAP = {
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
	is_listed: "isListed"
};
function toUpdateBody(patch) {
	const body = {};
	for (const [key, value] of Object.entries(patch)) {
		const apiKey = UPDATE_FIELD_MAP[key];
		if (apiKey && value !== void 0) body[apiKey] = value;
	}
	return body;
}
function toSummary(row) {
	return {
		...row,
		active_students: toNumber(row["active_students"]),
		classes_today: toNumber(row["classes_today"]),
		completed_lessons: toNumber(row["completed_lessons"]),
		hourly_rate: toNumber(row["hourly_rate"]),
		onboarding_step: toNumber(row["onboarding_step"]),
		pending_requests: toNumber(row["pending_requests"]),
		upcoming_classes: toNumber(row["upcoming_classes"])
	};
}
function toTutorBooking(row) {
	return {
		...row,
		duration_minutes: toNumber(row["duration_minutes"]),
		hourly_rate: toNumber(row["hourly_rate"]),
		total_amount: toNumber(row["total_amount"]),
		payment_amount: row["payment_amount"] == null ? null : toNumber(row["payment_amount"])
	};
}
function toTutorStudent(row) {
	return {
		...row,
		lessons_completed: toNumber(row["lessons_completed"]),
		lessons_upcoming: toNumber(row["lessons_upcoming"])
	};
}
function toMySubject(s) {
	return {
		id: s.id,
		subject_id: s.subjectId,
		education_level_id: s.educationLevelId,
		subjects: s.subjectName ? { name: s.subjectName } : null,
		education_levels: s.levelName ? { name: s.levelName } : null
	};
}
function toWindow(w) {
	return {
		id: w.id,
		day_of_week: w.dayOfWeek,
		start_time: w.startTime,
		end_time: w.endTime,
		timezone: w.timezone,
		is_active: w.isActive
	};
}
function toDocument(d) {
	return {
		id: d.id,
		step_id: d.stepId,
		label: d.label,
		storage_path: "",
		mime_type: d.mimeType,
		size_bytes: d.sizeBytes,
		status: d.status,
		reviewer_notes: d.reviewerNotes,
		created_at: d.createdAt
	};
}
/** The signed-in tutor's own record. Created on demand by the backend. */
function useTutorRecord() {
	const { user, loading } = useAuth();
	useQueryClient();
	return useQuery({
		queryKey: ["tutor-record", user?.id],
		enabled: Boolean(user?.id) && !loading,
		queryFn: async () => {
			return toTutorRow(await apiGet("/tutors/me"));
		}
	});
}
function useUpdateTutor() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (patch) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			await apiPatch("/tutors/me", toUpdateBody(patch));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-record"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useTutorSummary() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["tutor-summary", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const row = await apiGet("/tutors/me/dashboard");
			return row ? toSummary(row) : null;
		}
	});
}
function useTutorBookings(params) {
	const { user } = useAuth();
	return useQuery({
		queryKey: [
			"tutor-bookings",
			user?.id,
			params?.from ?? null,
			params?.to ?? null,
			params?.statuses ?? null
		],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const search = new URLSearchParams();
			if (params?.from) search.set("from", params.from);
			if (params?.to) search.set("to", params.to);
			if (params?.statuses?.length) search.set("statuses", params.statuses.join(","));
			const query = search.toString();
			return (await apiGet(`/bookings/tutor-schedule${query ? `?${query}` : ""}`)).map(toTutorBooking);
		}
	});
}
function useTutorStudents() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["tutor-students", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/students?limit=100")).map(toTutorStudent);
		}
	});
}
function useRespondToBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ bookingId, accept }) => {
			return apiPost(`/bookings/${bookingId}/respond`, { accept });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-students"] });
		}
	});
}
function useMyTutorSubjects() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-my-subjects", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/subjects")).map(toMySubject);
		}
	});
}
function useAddTutorSubject() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			await apiPost("/tutors/me/subjects", {
				subjectId: input.subjectId,
				...input.educationLevelId ? { educationLevelId: input.educationLevelId } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-my-subjects"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useRemoveTutorSubject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			await apiDelete(`/tutors/me/subjects/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-my-subjects"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useAvailabilityWindows() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-availability", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/availability")).map(toWindow);
		}
	});
}
function useAddAvailabilityWindow() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			await apiPost("/tutors/me/availability/window", input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useUpdateAvailabilityWindow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			await apiPatch(`/tutors/me/availability/${input.id}`, { isActive: input.isActive });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useDeleteAvailabilityWindow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			await apiDelete(`/tutors/me/availability/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-availability"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useVerificationSteps() {
	const { user } = useAuth();
	return useQuery({
		queryKey: [
			"verification-steps",
			"tutor",
			user?.id
		],
		enabled: Boolean(user?.id),
		staleTime: 3e5,
		queryFn: async () => {
			return (await apiGet("/tutors/me/verification")).map((s) => ({
				id: s.id,
				code: s.code,
				name: s.name,
				description: s.description,
				is_required: s.isRequired,
				sort_order: s.sortOrder
			}));
		}
	});
}
function useVerificationProgress() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-verification-progress", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/verification")).filter((s) => s.status !== null).map((s) => ({
				id: s.id,
				step_id: s.id,
				status: s.status,
				reviewer_notes: s.reviewerNotes,
				reviewed_at: s.reviewedAt
			}));
		}
	});
}
function useTutorDocuments() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-documents", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/documents")).map(toDocument);
		}
	});
}
function useUploadTutorDocument() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			const uploaded = await apiUpload("tutor-documents", input.file);
			await apiPost("/tutors/me/documents", {
				label: input.label,
				storagePath: uploaded.storagePath,
				sizeBytes: uploaded.sizeBytes,
				...input.stepId ? { stepId: input.stepId } : {},
				...uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-documents"] });
		}
	});
}
function useDeleteTutorDocument() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (doc) => {
			await apiDelete(`/tutors/me/documents/${doc.id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-documents"] });
		}
	});
}
function useSubmitVerification() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return (await apiPost("/tutors/me/verification/submit", {})).status;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-record"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-verification-progress"] });
			queryClient.invalidateQueries({ queryKey: ["verification-steps"] });
		}
	});
}
var VERIFICATION_LABEL = {
	unverified: "Not submitted",
	pending: "Submitted for review",
	in_review: "Under review",
	verified: "Verified",
	rejected: "Needs changes",
	suspended: "Suspended"
};
var VERIFICATION_TONE = {
	unverified: "bg-muted text-muted-foreground",
	pending: "bg-secondary-soft text-foreground",
	in_review: "bg-primary-soft text-primary-deep",
	verified: "bg-success/12 text-success",
	rejected: "bg-destructive/12 text-destructive",
	suspended: "bg-destructive/12 text-destructive"
};
/** Weekday labels for availability. Index matches the stored day_of_week (0 = Sunday). */
var WEEKDAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
function useTutorTimezone() {
	const { data: tutor } = useTutorRecord();
	const { profile } = useAuth();
	return tutor?.timezone || profile?.timezone || "UTC";
}
//#endregion
export { useVerificationSteps as C, useVerificationProgress as S, useTutorSummary as _, useAddTutorSubject as a, useUpdateTutor as b, useDeleteTutorDocument as c, useRespondToBooking as d, useSubmitVerification as f, useTutorStudents as g, useTutorRecord as h, useAddAvailabilityWindow as i, useMyTutorSubjects as l, useTutorDocuments as m, VERIFICATION_TONE as n, useAvailabilityWindows as o, useTutorBookings as p, WEEKDAYS as r, useDeleteAvailabilityWindow as s, VERIFICATION_LABEL as t, useRemoveTutorSubject as u, useTutorTimezone as v, useUploadTutorDocument as x, useUpdateAvailabilityWindow as y };
