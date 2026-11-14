import { i as authClient, r as apiRequest } from "./auth-DVJYIAuV.mjs";
import { n as useAuth } from "./use-auth-DHsIU0kT.mjs";
import { a as apiPost, n as apiDelete, o as apiUpload, r as apiGet, s as openApiFile, t as API_FILE_PREFIX } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { h as useTutorRecord } from "./tutor-data-BgedrW1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-workspace-DMY2LNJP.js
/** Raw function rows arrive with NUMERIC/bigint columns possibly stringified. */
function withNumbers(row, keys) {
	const out = { ...row };
	for (const key of keys) {
		const value = out[key];
		if (value !== null && value !== void 0) out[key] = Number(value);
	}
	return out;
}
/** PUT with the session token; data-client has no apiPut. */
async function apiPut(path, body) {
	const { data } = await authClient.getSession();
	const accessToken = data.session?.access_token;
	return apiRequest(path, {
		method: "PUT",
		body,
		...accessToken ? { accessToken } : {}
	});
}
function useClassSession(bookingId) {
	return useQuery({
		queryKey: ["tutor-class-session", bookingId],
		enabled: Boolean(bookingId),
		queryFn: async () => {
			const row = await apiPost(`/bookings/${bookingId}/class/open`, {});
			return row ? withNumbers(row, ["duration_minutes"]) : null;
		}
	});
}
function useStartClass() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (bookingId) => {
			await apiPost(`/bookings/${bookingId}/class/start`, {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-class-session"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
		}
	});
}
function useEndClass() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			await apiPost(`/bookings/${input.bookingId}/class/end`, input.studentAttended === void 0 ? {} : { studentAttended: input.studentAttended });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-class-session"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-summary"] });
		}
	});
}
function useLessonNote(bookingId) {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-lesson-note", bookingId],
		enabled: Boolean(bookingId),
		queryFn: async () => {
			const note = (await apiGet(`/bookings/${bookingId}/lesson-notes`))[0];
			if (!note) return null;
			return {
				id: note.id,
				booking_id: note.bookingId,
				tutor_id: tutor?.id ?? "",
				covered: note.covered,
				understanding: note.understanding,
				improvements: note.improvements,
				next_steps: note.nextSteps,
				created_at: note.createdAt,
				updated_at: note.updatedAt
			};
		}
	});
}
function useSaveLessonNote(bookingId) {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id || !bookingId) throw new Error("Lesson is not ready yet.");
			await apiPut(`/bookings/${bookingId}/lesson-notes`, {
				covered: input.covered,
				understanding: input.understanding,
				improvements: input.improvements,
				nextSteps: input.next_steps
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-lesson-note"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-bookings"] });
		}
	});
}
function useLearningResources() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-resources", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/learning-resources?limit=100")).data.filter((r) => r.tutorId === tutor.id).map((r) => ({
				id: r.id,
				tutor_id: r.tutorId,
				title: r.title,
				description: r.description,
				resource_type: r.resourceType,
				external_url: r.externalUrl,
				storage_path: r.hasFile ? `${API_FILE_PREFIX}${r.id}` : null,
				mime_type: null,
				size_bytes: null,
				subject_id: r.subjectId,
				student_id: r.studentId,
				is_shared: r.isShared,
				created_at: r.createdAt,
				updated_at: r.createdAt,
				subjects: r.subjectName ? { name: r.subjectName } : null,
				students: r.studentFirstName ? { first_name: r.studentFirstName } : null
			}));
		}
	});
}
function useCreateResource() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			const uploaded = input.file ? await apiUpload("learning-resources", input.file) : null;
			input.onProgress?.(85);
			await apiPost("/learning-resources", {
				title: input.title,
				resourceType: input.resourceType,
				...input.description ? { description: input.description } : {},
				...input.externalUrl ? { externalUrl: input.externalUrl } : {},
				...input.subjectId ? { subjectId: input.subjectId } : {},
				...input.studentId ? { studentId: input.studentId } : {},
				...uploaded ? {
					storagePath: uploaded.storagePath,
					sizeBytes: uploaded.sizeBytes,
					...uploaded.mimeType ? { mimeType: uploaded.mimeType } : {}
				} : {}
			});
			input.onProgress?.(100);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-resources"] });
		}
	});
}
function useDeleteResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (resource) => {
			await apiDelete(`/learning-resources/${resource.id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-resources"] });
		}
	});
}
/**
* Private files are only ever reachable through a short-lived signed link,
* minted by the API, which checks access before issuing one.
*/
async function openStoredFile(path) {
	const key = path.startsWith("api-file:") ? path.slice(API_FILE_PREFIX.length) : path;
	await openApiFile(`/files/learning-resources/${key}/url`);
}
function toAssignmentRow(a) {
	return {
		id: a.id,
		tutor_id: a.tutorId,
		student_id: a.studentId,
		booking_id: a.bookingId,
		subject_id: a.subjectId,
		resource_id: a.resourceId,
		title: a.title,
		instructions: a.instructions,
		submission_requirements: a.submissionRequirements,
		due_at: a.dueAt,
		status: a.status,
		assigned_at: null,
		submission_text: a.submissionText,
		submission_path: null,
		submitted_at: a.submittedAt,
		feedback: a.feedback,
		reviewed_at: a.reviewedAt,
		created_at: a.createdAt,
		updated_at: a.createdAt,
		students: a.studentFirstName ? {
			first_name: a.studentFirstName,
			avatar_url: a.studentAvatarUrl
		} : null,
		subjects: a.subjectName ? { name: a.subjectName } : null,
		learning_resources: a.resourceTitle ? { title: a.resourceTitle } : null
	};
}
function useAssignments(params) {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: [
			"tutor-assignments",
			tutor?.id,
			params?.studentId ?? null
		],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			const search = new URLSearchParams({ limit: "100" });
			if (params?.studentId) search.set("studentId", params.studentId);
			return (await apiGet(`/assignments?${search.toString()}`)).data.filter((a) => a.tutorId === tutor.id).map(toAssignmentRow).sort((a, b) => b.created_at.localeCompare(a.created_at));
		}
	});
}
function useCreateAssignment() {
	const queryClient = useQueryClient();
	const { data: tutor } = useTutorRecord();
	return useMutation({
		mutationFn: async (input) => {
			if (!tutor?.id) throw new Error("Tutor profile is not ready yet.");
			await apiPost("/assignments", {
				studentId: input.studentId,
				title: input.title,
				assignNow: input.assignNow,
				...input.instructions ? { instructions: input.instructions } : {},
				...input.submissionRequirements ? { submissionRequirements: input.submissionRequirements } : {},
				...input.subjectId ? { subjectId: input.subjectId } : {},
				...input.resourceId ? { resourceId: input.resourceId } : {},
				...input.dueAt ? { dueAt: input.dueAt } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-assignments"] });
		}
	});
}
function useUpdateAssignment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			if (input.patch.status === "assigned") {
				await apiPost(`/assignments/${input.id}/assign`, {});
				return;
			}
			if (input.patch.status === "reviewed") {
				await apiPost(`/assignments/${input.id}/review`, input.patch.feedback ? { feedback: input.patch.feedback } : {});
				return;
			}
			throw new Error("That change isn't supported yet.");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-assignments"] });
		}
	});
}
function useEarningsSummary() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["tutor-earnings-summary", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const s = await apiGet("/payments/earnings");
			if (!s) return null;
			return {
				currency: s.currency,
				gross_revenue: Number(s.grossRevenue),
				platform_commission: Number(s.platformCommission),
				payment_fees: Number(s.paymentFees),
				net_earnings: Number(s.netEarnings),
				pending_earnings: Number(s.pendingEarnings),
				paid_out: Number(s.paidOut),
				pending_payouts: Number(s.pendingPayouts),
				available_balance: Number(s.availableBalance),
				minimum_payout: Number(s.minimumPayout),
				next_payout_date: s.nextPayoutDate ?? "",
				schedule_label: s.scheduleLabel ?? ""
			};
		}
	});
}
function useEarningsRecords(limit = 50) {
	const { user } = useAuth();
	return useQuery({
		queryKey: [
			"tutor-earnings-records",
			user?.id,
			limit
		],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet(`/payments/earnings/records?limit=${Math.min(limit, 100)}`)).map((row) => withNumbers(row, [
				"gross_amount",
				"commission_amount",
				"platform_fee",
				"net_amount",
				"exchange_rate"
			]));
		}
	});
}
function usePayouts() {
	const { data: tutor } = useTutorRecord();
	return useQuery({
		queryKey: ["tutor-payouts", tutor?.id],
		enabled: Boolean(tutor?.id),
		queryFn: async () => {
			return (await apiGet("/payments/payouts?limit=100")).data.map((p) => ({
				id: p.id,
				tutor_id: tutor.id,
				amount: Number(p.amount),
				currency: p.currency,
				status: p.status,
				reference: p.reference,
				notes: p.notes,
				requested_at: p.requestedAt,
				settled_at: p.settledAt,
				created_at: p.requestedAt,
				updated_at: p.settledAt ?? p.requestedAt
			}));
		}
	});
}
function useRequestPayout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (amount) => {
			return (await apiPost("/payments/payouts", { amount })).id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tutor-payouts"] });
			queryClient.invalidateQueries({ queryKey: ["tutor-earnings-summary"] });
		}
	});
}
function useRatingSummary() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["tutor-rating-summary", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			const row = await apiGet("/tutors/me/ratings/summary");
			return row ? withNumbers(row, [
				"rating_avg",
				"rating_count",
				"five_star",
				"four_star",
				"three_star",
				"two_star",
				"one_star"
			]) : null;
		}
	});
}
function useRatingCategories() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["tutor-rating-categories", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/tutors/me/ratings/categories")).map((row) => withNumbers(row, ["average_score", "response_count"]));
		}
	});
}
function useTutorReviews(limit = 20) {
	const { user } = useAuth();
	return useQuery({
		queryKey: [
			"tutor-reviews",
			user?.id,
			limit
		],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet(`/tutors/me/reviews?limit=${Math.min(limit, 100)}`)).map((row) => withNumbers(row, ["score"]));
		}
	});
}
function useConversations() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["conversations", user?.id],
		enabled: Boolean(user?.id),
		queryFn: async () => {
			return (await apiGet("/conversations")).map((row) => ({
				...row,
				unread_count: Number(row.unread_count ?? 0)
			}));
		}
	});
}
function useMessages(conversationId, limit = 100) {
	return useQuery({
		queryKey: [
			"messages",
			conversationId,
			limit
		],
		enabled: Boolean(conversationId),
		queryFn: async () => {
			return (await apiGet(`/conversations/${conversationId}/messages?limit=${Math.min(limit, 100)}`)).data.filter((m) => !m.isHidden).map((m) => ({
				id: m.id,
				body: m.body,
				sender_id: m.senderId,
				created_at: m.createdAt,
				attachment_path: null,
				attachment_name: m.attachmentName
			}));
		}
	});
}
function useSendMessage(conversationId) {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	return useMutation({
		mutationFn: async (body) => {
			if (!conversationId || !user?.id) throw new Error("Conversation is not ready yet.");
			await apiPost(`/conversations/${conversationId}/messages`, { body });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
function useMarkConversationRead() {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	return useMutation({
		mutationFn: async (conversationId) => {
			if (!user?.id) return;
			await apiPost(`/conversations/${conversationId}/read`, {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
function useStartConversation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return (await apiPost("/conversations", {
				studentId: input.studentId,
				...input.subject ? { subject: input.subject } : {}
			})).id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
var ASSIGNMENT_LABEL = {
	draft: "Draft",
	assigned: "Assigned",
	submitted: "Submitted",
	reviewed: "Reviewed"
};
var ASSIGNMENT_TONE = {
	draft: "bg-muted text-muted-foreground",
	assigned: "bg-primary-soft text-primary-deep",
	submitted: "bg-secondary-soft text-foreground",
	reviewed: "bg-success/12 text-success"
};
var PAYOUT_LABEL = {
	requested: "Requested",
	processing: "Processing",
	paid: "Paid",
	rejected: "Rejected",
	cancelled: "Cancelled"
};
var PAYOUT_TONE = {
	requested: "bg-secondary-soft text-foreground",
	processing: "bg-primary-soft text-primary-deep",
	paid: "bg-success/12 text-success",
	rejected: "bg-destructive/12 text-destructive",
	cancelled: "bg-muted text-muted-foreground"
};
var RESOURCE_LABEL = {
	pdf: "PDF",
	video: "Video",
	link: "Link",
	document: "Document",
	image: "Image",
	other: "File"
};
//#endregion
export { useRequestPayout as C, useStartConversation as D, useStartClass as E, useTutorReviews as O, useRatingSummary as S, useSendMessage as T, useLessonNote as _, RESOURCE_LABEL as a, usePayouts as b, useClassSession as c, useCreateResource as d, useDeleteResource as f, useLearningResources as g, useEndClass as h, PAYOUT_TONE as i, useUpdateAssignment as k, useConversations as l, useEarningsSummary as m, ASSIGNMENT_TONE as n, openStoredFile as o, useEarningsRecords as p, PAYOUT_LABEL as r, useAssignments as s, ASSIGNMENT_LABEL as t, useCreateAssignment as u, useMarkConversationRead as v, useSaveLessonNote as w, useRatingCategories as x, useMessages as y };
