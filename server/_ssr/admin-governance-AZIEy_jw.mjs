import { i as authClient, r as apiRequest } from "./auth-DVJYIAuV.mjs";
import { a as apiPost, r as apiGet } from "./data-client-kVSxwzg_.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-governance-AZIEy_jw.js
/** Everyone holding admin or super_admin, for the Admins screen. */
function useAdminAccounts() {
	return useQuery({
		queryKey: ["governance-admin-accounts"],
		queryFn: async () => {
			return (await apiGet("/admin/governance/accounts")).map(({ roles, ...account }) => ({
				...account,
				user_roles: roles.map((role) => ({ role }))
			}));
		}
	});
}
function isSuperAdminAccount(account) {
	return (account.user_roles ?? []).some((r) => r.role === "super_admin");
}
function useAdminInvitations() {
	return useQuery({
		queryKey: ["governance-invitations"],
		queryFn: async () => {
			return apiGet("/admin/governance/invitations");
		}
	});
}
function useRevokeInvitation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (invitationId) => {
			await apiPost(`/admin/governance/invitations/${invitationId}/revoke`, {});
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["governance-invitations"] })
	});
}
/** The full permission catalogue, for building the grant/deny matrix. */
function usePermissionCatalog() {
	return useQuery({
		queryKey: ["governance-permission-catalog"],
		staleTime: 3e5,
		queryFn: async () => {
			return apiGet("/admin/governance/permissions");
		}
	});
}
/** Per-user overrides. Absence of a row means "inherit from the role". */
function useUserPermissions(userId) {
	return useQuery({
		queryKey: ["governance-user-permissions", userId],
		enabled: Boolean(userId),
		queryFn: async () => {
			return apiGet(`/admin/governance/users/${userId}/permissions`);
		}
	});
}
/** `granted: null` clears the override and falls back to the role grant. */
function useSetUserPermission() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			await apiPut(`/admin/governance/users/${input.userId}/permissions/${encodeURIComponent(input.permissionKey)}`, { granted: input.granted });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["governance-user-permissions"] });
		}
	});
}
function useRequestElevatedRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return (await apiPost(`/admin/governance/users/${input.userId}/elevated-role`, {
				role: input.role,
				revoke: input.revoke ?? false
			})).requestId;
		},
		onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] })
	});
}
function useActionRequests(status) {
	const filter = status ?? "pending";
	return useQuery({
		queryKey: ["governance-action-requests", filter],
		queryFn: async () => {
			return (await apiGet(`/admin/governance/requests?status=${filter}`)).map(({ requester_name, requester_email, reviewer_name, reviewer_email, ...row }) => ({
				...row,
				requester: {
					full_name: requester_name,
					email: requester_email
				},
				reviewer: row.reviewed_by === null ? null : {
					full_name: reviewer_name,
					email: reviewer_email
				}
			}));
		}
	});
}
function useReviewActionRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return apiPost(`/admin/governance/requests/${input.requestId}/review`, {
				approve: input.approve,
				...input.notes ? { notes: input.notes } : {}
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
			queryClient.invalidateQueries({ queryKey: ["governance-admin-accounts"] });
			queryClient.invalidateQueries({ queryKey: ["governance-audit-logs"] });
			queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
			queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
			queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
			queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
		}
	});
}
function useAuditLogs(filters = {}) {
	return useQuery({
		queryKey: [
			"governance-audit-logs",
			filters.action ?? null,
			filters.entityType ?? null,
			filters.actorEmail ?? null,
			filters.from ?? null,
			filters.to ?? null
		],
		queryFn: async () => {
			const query = new URLSearchParams();
			if (filters.action) query.set("action", filters.action);
			if (filters.entityType) query.set("entityType", filters.entityType);
			if (filters.actorEmail) query.set("actorEmail", filters.actorEmail);
			if (filters.from) query.set("from", filters.from);
			if (filters.to) query.set("to", filters.to);
			return apiGet(`/admin/governance/audit-logs?${query.toString()}`);
		}
	});
}
/**
* Sets a new password, then clears the forced-change flag.
*
* Under the API the current password is required, and changing it signs out
* every session — so this signs straight back in with the new one, keeping the
* admin where they are. The API clears the forced-change flag itself.
*/
function useChangeOwnPassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			if (typeof input === "string") throw new Error("Enter your current password.");
			await apiPost("/auth/password/change", {
				currentPassword: input.currentPassword,
				newPassword: input.password
			});
			const { error } = await authClient.signInWithPassword({
				email: input.email,
				password: input.password
			});
			if (error) throw error;
		},
		onSuccess: () => void queryClient.invalidateQueries()
	});
}
var REQUEST_ACTION_LABEL = {
	"payment.refund": "Refund payment",
	"booking.cancel_with_refund": "Cancel booking with refund",
	"payout.settle": "Settle payout",
	"user_roles.grant_elevated": "Change admin role",
	"profile.suspend": "Suspend or restore account"
};
var REQUEST_STATUS_LABEL = {
	pending: "Awaiting approval",
	approved: "Approved",
	rejected: "Rejected",
	executed: "Applied",
	failed: "Failed"
};
var REQUEST_STATUS_TONE = {
	pending: "bg-secondary-soft text-foreground",
	approved: "bg-primary-soft text-primary-deep",
	rejected: "bg-muted text-muted-foreground",
	executed: "bg-success/12 text-success",
	failed: "bg-destructive/12 text-destructive"
};
var INVITATION_STATUS_LABEL = {
	pending: "Waiting to be accepted",
	accepted: "Accepted",
	revoked: "Revoked",
	expired: "Expired"
};
var INVITATION_STATUS_TONE = {
	pending: "bg-secondary-soft text-foreground",
	accepted: "bg-success/12 text-success",
	revoked: "bg-muted text-muted-foreground",
	expired: "bg-destructive/12 text-destructive"
};
/**
* The governance RPCs raise bare SCREAMING_SNAKE codes. This turns them into
* sentences, matching how the auth forms map Supabase's own error strings.
*/
function friendlyAdminError(error) {
	const raw = String(error?.message ?? error ?? "").toUpperCase();
	if (raw.includes("SELF_APPROVAL_FORBIDDEN")) return "You raised this request, so someone else has to approve it.";
	if (raw.includes("SELF_ROLE_GRANT_FORBIDDEN")) return "You can't change your own roles.";
	if (raw.includes("SELF_SUSPEND_FORBIDDEN")) return "You can't suspend your own account.";
	if (raw.includes("ELEVATED_ROLE_REQUIRES_SUPER_ADMIN")) return "Only a super admin can grant or remove admin access.";
	if (raw.includes("ELEVATED_ROLE_REQUIRES_APPROVAL")) return "Admin access is changed in Admins & roles, where it goes for approval.";
	if (raw.includes("LAST_SUPER_ADMIN_PROTECTED")) return "This is the last super admin. Promote someone else before removing this one.";
	if (raw.includes("REQUEST_ALREADY_REVIEWED")) return "Someone already reviewed this request.";
	if (raw.includes("REQUEST_NOT_FOUND")) return "That request no longer exists.";
	if (raw.includes("INVITATION_EXPIRED")) return "That invitation has expired. Ask for a new one.";
	if (raw.includes("INVITATION_NOT_FOUND")) return "We couldn't find a pending invitation for that address.";
	if (raw.includes("INVALID_OTP")) return "That one-time password isn't right. Check your invitation email.";
	if (raw.includes("EMAIL_MISMATCH")) return "You're signed in as a different account than the one invited.";
	if (raw.includes("EMAIL_DOMAIN_NOT_ALLOWED")) return "That email domain isn't on the allowed list for admin invitations.";
	if (raw.includes("INVITE_DOMAIN_ALLOWLIST_EMPTY")) return "No invite domains are configured yet. Add one in Platform settings first.";
	if (raw.includes("PAYMENT_NOT_REFUNDABLE")) return "That payment can no longer be refunded.";
	if (raw.includes("PAYOUT_NOT_SETTLEABLE")) return "That payout is no longer awaiting settlement.";
	if (raw.includes("PAYOUT_NOT_REJECTABLE")) return "That payout is no longer awaiting a decision.";
	if (raw.includes("NOT_AUTHORIZED")) return "You don't have permission to do that.";
	if (raw.includes("NETWORK") || raw.includes("FETCH")) return "Something went wrong. Please check your connection and try again.";
	return "We couldn't complete that just now. Please try again.";
}
/** Turns an audit action key like `user_roles.insert` into readable text. */
function humanizeAuditAction(action) {
	const parts = action.split(".");
	const entity = parts[0] ?? action;
	const verb = parts[1];
	if (!verb) return action;
	const entityLabel = entity.replace(/_/g, " ");
	const verbLabel = verb === "insert" ? "created" : verb === "update" ? "updated" : verb === "delete" ? "deleted" : verb;
	return `${entityLabel.charAt(0).toUpperCase()}${entityLabel.slice(1)} ${verbLabel}`;
}
function field(payload, key) {
	const value = payload[key];
	return value === null || value === void 0 ? "" : String(value);
}
function shortId(payload, key) {
	return field(payload, key).slice(0, 8) || "—";
}
/** One-line summary of a request payload for the approvals table. */
function summarizeRequestPayload(action, payload) {
	switch (action) {
		case "payment.refund": return `Refund ${field(payload, "amount") || "?"} on payment ${shortId(payload, "payment_id")}`;
		case "booking.cancel_with_refund": return `Booking ${shortId(payload, "booking_id")} — ${field(payload, "reason") || "no reason given"}`;
		case "payout.settle": return `Payout ${shortId(payload, "payout_id")}`;
		case "user_roles.grant_elevated": return `${payload["revoke"] ? "Remove" : "Grant"} ${field(payload, "role")} for ${shortId(payload, "user_id")}`;
		case "profile.suspend": return `${payload["is_active"] ? "Restore" : "Suspend"} account ${shortId(payload, "profile_id")}`;
		default: return JSON.stringify(payload);
	}
}
/** Super admin: create an invitation; the API emails the one-time code. */
async function inviteAdminViaApi(input) {
	return apiPost("/admin/governance/invitations", input);
}
/** The invitee, signed in as the invited address, redeems their code. */
async function redeemInvitationViaApi(email, otp) {
	await apiPost("/invitations/redeem", {
		email,
		otp
	});
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
//#endregion
export { useUserPermissions as S, usePermissionCatalog as _, REQUEST_STATUS_TONE as a, useRevokeInvitation as b, inviteAdminViaApi as c, summarizeRequestPayload as d, useActionRequests as f, useChangeOwnPassword as g, useAuditLogs as h, REQUEST_STATUS_LABEL as i, isSuperAdminAccount as l, useAdminInvitations as m, INVITATION_STATUS_TONE as n, friendlyAdminError as o, useAdminAccounts as p, REQUEST_ACTION_LABEL as r, humanizeAuditAction as s, INVITATION_STATUS_LABEL as t, redeemInvitationViaApi as u, useRequestElevatedRole as v, useSetUserPermission as x, useReviewActionRequest as y };
