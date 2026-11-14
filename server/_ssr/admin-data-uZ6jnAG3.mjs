import { i as authClient, r as apiRequest, t as API_BASE_URL } from "./auth-DVJYIAuV.mjs";
import { a as apiPost, i as apiPatch, r as apiGet, t as API_FILE_PREFIX } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-data-uZ6jnAG3.js
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
/** Function rows arrive with NUMERIC/bigint columns possibly stringified. */
function numericRow(row, textKeys = []) {
	const out = {};
	for (const [key, value] of Object.entries(row)) out[key] = value === null || value === void 0 || textKeys.includes(key) ? value : Number(value);
	return out;
}
function useAdminSummary() {
	return useQuery({
		queryKey: ["admin-summary"],
		queryFn: async () => {
			const row = await apiGet("/admin/dashboard");
			return row ? numericRow(row, ["gmv_currency"]) : null;
		}
	});
}
function useAdminUsers(params) {
	const search = params?.search?.trim() ?? "";
	const role = params?.role ?? "all";
	return useQuery({
		queryKey: [
			"admin-users",
			search,
			role,
			params?.from ?? null,
			params?.to ?? null
		],
		queryFn: async () => {
			const query = new URLSearchParams();
			if (search) query.set("search", search);
			if (role !== "all") query.set("role", role);
			if (params?.from) query.set("from", params.from);
			if (params?.to) query.set("to", params.to);
			return (await apiGet(`/admin/users?${query.toString()}`)).map((u) => ({
				id: u.id,
				full_name: u.fullName,
				email: u.email,
				primary_role: u.primaryRole,
				is_active: u.isActive,
				onboarding_completed: u.onboardingCompleted,
				created_at: u.createdAt,
				user_roles: u.roles.map((r) => ({ role: r }))
			}));
		}
	});
}
/** Suspending or restoring an account changes who can reach the platform, so it
* goes through the approval queue rather than committing on the first click.
* Resolves to a request id — nothing has happened yet when this returns. */
function useSuspendUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, isActive }) => {
			return (await apiPost(`/admin/users/${id}/suspend`, { isActive })).requestId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
		}
	});
}
/** Ordinary roles are set directly through admin_set_user_roles(); anything
* touching admin or super_admin is refused there and must go through the
* approval queue instead (see useRequestElevatedRole in admin-governance.ts).
*
* Note this hook could never have worked before: user_roles was only ever
* granted SELECT to authenticated, so the direct insert/delete it used to do
* failed with 42501 every time. */
function useUpdateUserRoles() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ userId, roles }) => {
			await apiPost(`/users/${userId}/roles`, { roles });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["governance-admin-accounts"] });
		}
	});
}
function useVerificationQueue(status) {
	const filter = status ?? "pending";
	return useQuery({
		queryKey: ["admin-verification-queue", filter],
		queryFn: async () => {
			return (await apiGet(`/admin/verification?status=${filter}`)).map((t) => ({
				id: t.id,
				profile_id: t.profileId,
				headline: t.headline,
				verification_status: t.verificationStatus,
				is_listed: t.isListed,
				submitted_at: t.submittedAt,
				years_experience: t.yearsExperience,
				hourly_rate: t.hourlyRate === null ? null : Number(t.hourlyRate),
				currency: t.currency,
				profiles: {
					full_name: t.fullName,
					email: t.email,
					avatar_url: t.avatarUrl
				},
				agency_name: t.agencyName
			}));
		}
	});
}
function useTutorVerificationDetail(tutorId) {
	return useQuery({
		queryKey: ["admin-verification-detail", tutorId],
		enabled: Boolean(tutorId),
		queryFn: async () => {
			const detail = await apiGet(`/admin/verification/${tutorId}`);
			return {
				steps: detail.steps.map((step) => ({
					...step,
					sort_order: Number(step.sort_order)
				})),
				progress: detail.progress,
				documents: detail.documents.map(({ has_file: hasFile, ...doc }) => ({
					...doc,
					size_bytes: doc.size_bytes === null ? null : Number(doc.size_bytes),
					storage_path: hasFile ? `${API_FILE_PREFIX}${doc.id}` : ""
				}))
			};
		}
	});
}
function useReviewTutorDocument() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			await apiPatch(`/admin/verification/documents/${input.documentId}`, {
				status: input.status,
				...input.reviewerNotes ? { reviewerNotes: input.reviewerNotes } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
		}
	});
}
function useDocumentUrl() {
	return useMutation({ mutationFn: async (storagePath) => {
		if (storagePath.startsWith("api-file:")) {
			const { url } = await apiGet(`/files/tutor-documents/${storagePath.slice(API_FILE_PREFIX.length)}/url`);
			return new URL(url, API_BASE_URL || window.location.origin).toString();
		}
		throw new Error("This document has no uploaded file.");
	} });
}
/** Approve or reject a tutor's overall verification. Admin writes bypass the
* enforce_tutor_verification_rules() trigger's auto-management (it only
* forces is_listed *off* on any non-verified status), so approving here
* explicitly turns is_listed back on to actually make the tutor bookable. */
function useApproveTutor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (tutorId) => {
			await apiPost(`/admin/verification/${tutorId}/approve`, {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
			queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
/** Tutors cannot set their own hourly_rate (a BEFORE UPDATE trigger on
* public.tutors rejects the change from anyone who isn't is_admin() —
* defense in depth on top of the field being read-only in the tutor-facing
* UI). This is the one write path: admin sets it, here or in Users. */
function useSetTutorHourlyRate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ tutorId, hourlyRate }) => {
			await apiPatch(`/admin/tutors/${tutorId}/hourly-rate`, { hourlyRate });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
			queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
		}
	});
}
function useRejectTutor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ tutorId, reason }) => {
			await apiPost(`/admin/verification/${tutorId}/reject`, reason ? { reason } : {});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
			queryClient.invalidateQueries({ queryKey: ["admin-verification-detail"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
/** Flat admin API row → the nested shape the page reads. */
function toAdminBooking(row) {
	const r = row;
	return {
		id: r["id"],
		student_id: r["student_id"],
		tutor_id: r["tutor_id"],
		booked_by: r["booked_by"],
		subject_id: r["subject_id"],
		starts_at: r["starts_at"],
		ends_at: r["ends_at"],
		duration_minutes: Number(r["duration_minutes"]),
		status: r["status"],
		currency: r["currency"],
		total_amount: Number(r["total_amount"]),
		cancellation_policy_id: r["cancellation_policy_id"],
		cancelled_at: r["cancelled_at"],
		cancellation_reason: r["cancellation_reason"],
		created_at: r["created_at"],
		students: r["student_first_name"] ? {
			first_name: r["student_first_name"],
			last_name: r["student_last_name"]
		} : null,
		tutors: {
			id: r["tutor_id"],
			profiles: { full_name: r["tutor_name"] }
		},
		subjects: r["subject_name"] ? { name: r["subject_name"] } : null
	};
}
function useAdminBookings(params) {
	const search = params?.search?.trim() ?? "";
	const status = params?.status ?? "all";
	return useQuery({
		queryKey: [
			"admin-bookings",
			search,
			status,
			params?.from ?? null,
			params?.to ?? null
		],
		queryFn: async () => {
			const query = new URLSearchParams({ status });
			if (search) query.set("search", search);
			if (params?.from) query.set("from", params.from);
			if (params?.to) query.set("to", params.to);
			return (await apiGet(`/admin/bookings?${query.toString()}`)).map(toAdminBooking);
		}
	});
}
/** Non-financial status overrides only — cancellation always goes through
* useAdminCancelBooking() so the refund calculation isn't bypassed. */
function useAdminUpdateBookingStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status }) => {
			await apiPatch(`/admin/bookings/${id}/status`, { status });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
/** Cancels a booking and applies its cancellation policy's refund % (or an
* explicit override) to any paid payment, via admin_cancel_booking(). That
* function only runs once a second admin approves the request this submits;
* the hook resolves to the request id. */
function useAdminCancelBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return (await apiPost(`/admin/bookings/${input.bookingId}/cancel`, {
				reason: input.reason,
				...input.refundPercentage === null || input.refundPercentage === void 0 ? {} : { refundPercentage: input.refundPercentage }
			})).requestId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
			queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
			queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
		}
	});
}
function toAdminPayment(row) {
	const r = row;
	return {
		id: r["id"],
		booking_id: r["booking_id"],
		tutor_id: r["tutor_id"],
		payer_id: r["payer_id"],
		amount: Number(r["amount"]),
		currency: r["currency"],
		status: r["status"],
		provider: r["provider"],
		provider_reference: r["provider_reference"],
		paid_at: r["paid_at"],
		refunded_amount: r["refunded_amount"] === null ? null : Number(r["refunded_amount"]),
		created_at: r["created_at"],
		bookings: r["booking_starts_at"] ? {
			starts_at: r["booking_starts_at"],
			students: r["student_first_name"] ? {
				first_name: r["student_first_name"],
				last_name: r["student_last_name"]
			} : null,
			tutors: { profiles: { full_name: r["tutor_name"] } }
		} : null
	};
}
function useAdminPayments(params) {
	const status = params?.status ?? "all";
	return useQuery({
		queryKey: [
			"admin-payments",
			status,
			params?.from ?? null,
			params?.to ?? null
		],
		queryFn: async () => {
			const query = new URLSearchParams({ status });
			if (params?.from) query.set("from", params.from);
			if (params?.to) query.set("to", params.to);
			return (await apiGet(`/admin/payments?${query.toString()}`)).map(toAdminPayment);
		}
	});
}
function useAdminRefunds() {
	return useQuery({
		queryKey: ["admin-refunds"],
		queryFn: async () => {
			return (await apiGet("/admin/payments?status=refunded")).map(toAdminPayment);
		}
	});
}
/** Submits the refund for approval. The clamp against the payment total
* happens in the dispatcher, at execution time, so an amount cannot be made
* stale by anything that happens while the request waits. */
function useIssueRefund() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ paymentId, amount, reason }) => {
			return (await apiPost(`/admin/payments/${paymentId}/refund`, {
				amount,
				...reason ? { reason } : {}
			})).requestId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
			queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
			queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
function useAdminPayouts(params) {
	const status = params?.status ?? "all";
	return useQuery({
		queryKey: ["admin-payouts", status],
		queryFn: async () => {
			return (await apiGet(`/admin/payouts?status=${status}`)).map((row) => {
				const r = row;
				return {
					id: r["id"],
					tutor_id: r["tutor_id"],
					amount: Number(r["amount"]),
					currency: r["currency"],
					status: r["status"],
					reference: r["reference"],
					notes: r["notes"],
					requested_at: r["requested_at"],
					settled_at: r["settled_at"],
					tutors: { profiles: { full_name: r["tutor_name"] } }
				};
			});
		}
	});
}
/** Settling a payout moves money out, so it needs a second approver. */
function useSettlePayout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			return (await apiPost(`/admin/payouts/${id}/settle`, {})).requestId;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
			queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
		}
	});
}
/** Rejecting moves no money, so it stays single-step. */
function useRejectPayout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			await apiPost(`/admin/payouts/${id}/reject`, {});
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] })
	});
}
function useAdminDisputes(status) {
	const filter = status ?? "open";
	return useQuery({
		queryKey: ["admin-disputes", filter],
		queryFn: async () => {
			return (await apiGet(`/admin/disputes?status=${filter}`)).map((row) => {
				const r = row;
				return {
					id: r["id"],
					booking_id: r["booking_id"],
					category: r["category"],
					status: r["status"],
					description: r["description"],
					resolution_notes: r["resolution_notes"] ?? null,
					resolved_at: r["resolved_at"] ?? null,
					created_at: r["created_at"],
					raised_by_profile: { full_name: r["raised_by_name"] ?? null },
					against_profile: r["against_name"] ? { full_name: r["against_name"] } : null,
					bookings: r["booking_starts_at"] ? {
						starts_at: r["booking_starts_at"],
						subjects: r["subject_name"] ? { name: r["subject_name"] } : null
					} : null
				};
			});
		}
	});
}
function useResolveDispute() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			await apiPost(`/admin/disputes/${input.disputeId}/resolve`, {
				status: input.status,
				...input.notes ? { notes: input.notes } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
function useModerationReviews(params) {
	return useQuery({
		queryKey: ["admin-moderation-reviews", params?.onlyPublished ?? "all"],
		queryFn: async () => {
			const query = params?.onlyPublished === void 0 ? "" : `?published=${params.onlyPublished}`;
			return (await apiGet(`/admin/moderation/reviews${query}`)).map((row) => {
				const r = row;
				return {
					id: r["id"],
					score: Number(r["score"]),
					comment: r["comment"],
					is_published: r["is_published"],
					created_at: r["created_at"],
					tutor_id: r["tutor_id"],
					tutors: { profiles: { full_name: r["tutor_name"] } },
					profiles: { full_name: r["rater_name"] }
				};
			});
		}
	});
}
function useSetReviewPublished() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, isPublished }) => {
			await apiPatch(`/admin/moderation/reviews/${id}`, { isPublished });
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-moderation-reviews"] })
	});
}
function useModerationMessages(search) {
	const needle = search?.trim() ?? "";
	return useQuery({
		queryKey: ["admin-moderation-messages", needle],
		enabled: needle.length > 1,
		queryFn: async () => {
			return (await apiGet(`/admin/moderation/messages?search=${encodeURIComponent(needle)}`)).map((row) => {
				const r = row;
				return {
					id: r["id"],
					body: r["body"],
					sender_id: r["sender_id"],
					is_hidden: r["is_hidden"],
					created_at: r["created_at"],
					conversation_id: r["conversation_id"],
					profiles: { full_name: r["sender_name"] }
				};
			});
		}
	});
}
function useSetMessageHidden() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, isHidden, reason }) => {
			await apiPatch(`/admin/moderation/messages/${id}`, {
				isHidden,
				...isHidden && reason ? { reason } : {}
			});
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-moderation-messages"] })
	});
}
function useAdminReportSummary(from, to) {
	return useQuery({
		queryKey: [
			"admin-report-summary",
			from,
			to
		],
		enabled: Boolean(from && to),
		queryFn: async () => {
			const row = await apiGet(`/admin/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
			return row ? numericRow(row, ["gmv_currency"]) : null;
		}
	});
}
function useAdminAgencies(status) {
	return useQuery({
		queryKey: ["admin-agencies", status],
		queryFn: async () => {
			return apiGet(`/admin/agencies?status=${status}`);
		}
	});
}
function useAdminAgency(agencyId) {
	return useQuery({
		queryKey: ["admin-agency", agencyId],
		enabled: Boolean(agencyId),
		queryFn: async () => {
			return apiGet(`/admin/agencies/${agencyId}`);
		}
	});
}
function useAgencyAdminInvalidate() {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
		queryClient.invalidateQueries({ queryKey: ["admin-agency"] });
		queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
	};
}
function useReviewAgencyStep() {
	const invalidate = useAgencyAdminInvalidate();
	return useMutation({
		mutationFn: async (input) => {
			await apiPut(`/admin/agencies/${input.agencyId}/steps/${input.stepId}`, {
				status: input.status,
				...input.reviewerNotes ? { reviewerNotes: input.reviewerNotes } : {}
			});
		},
		onSuccess: invalidate
	});
}
function useDecideAgency() {
	const invalidate = useAgencyAdminInvalidate();
	return useMutation({
		mutationFn: async (input) => {
			await apiPost(`/admin/agencies/${input.agencyId}/decision`, {
				status: input.status,
				...input.reason ? { reason: input.reason } : {}
			});
		},
		onSuccess: invalidate
	});
}
function useSetAgencyShare() {
	const invalidate = useAgencyAdminInvalidate();
	return useMutation({
		mutationFn: async (input) => {
			await apiPatch(`/admin/agencies/${input.agencyId}/revenue-share`, { revenueSharePercentage: input.revenueSharePercentage });
		},
		onSuccess: invalidate
	});
}
var ROLE_LABEL = {
	student: "Student",
	parent: "Parent",
	tutor: "Tutor",
	agency: "Agency",
	admin: "Admin",
	super_admin: "Super admin"
};
//#endregion
export { useSuspendUser as A, useReviewAgencyStep as C, useSetReviewPublished as D, useSetMessageHidden as E, useUpdateUserRoles as M, useVerificationQueue as N, useSetTutorHourlyRate as O, useResolveDispute as S, useSetAgencyShare as T, useIssueRefund as _, useAdminCancelBooking as a, useRejectPayout as b, useAdminPayouts as c, useAdminSummary as d, useAdminUpdateBookingStatus as f, useDocumentUrl as g, useDecideAgency as h, useAdminBookings as i, useTutorVerificationDetail as j, useSettlePayout as k, useAdminRefunds as l, useApproveTutor as m, useAdminAgencies as n, useAdminDisputes as o, useAdminUsers as p, useAdminAgency as r, useAdminPayments as s, ROLE_LABEL as t, useAdminReportSummary as u, useModerationMessages as v, useReviewTutorDocument as w, useRejectTutor as x, useModerationReviews as y };
