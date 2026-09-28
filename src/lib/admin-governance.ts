import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { apiGet, apiPost, useApiData } from "@/lib/api/data-client";
import { authClient } from "@/lib/auth";
import {
  governanceRpc,
  governanceTable,
  type AdminActionRequestRow,
  type AdminInvitationRow,
  type AdminRequestAction,
  type AdminRequestStatus,
  type AuditLogRow,
  type GovernanceRole,
  type PermissionRow,
  type UserPermissionRow,
} from "@/integrations/supabase/governance-types";

/* ------------------------------------------------------------------ */
/* Admin accounts                                                      */
/* ------------------------------------------------------------------ */

export interface AdminAccount {
  id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  user_roles: { role: GovernanceRole }[];
}

/** Everyone holding admin or super_admin, for the Admins screen. */
export function useAdminAccounts() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["governance-admin-accounts"],
    queryFn: async (): Promise<AdminAccount[]> => {
      if (viaApi) {
        const rows = await apiGet<
          (Omit<AdminAccount, "user_roles"> & { roles: GovernanceRole[] })[]
        >("/admin/governance/accounts");
        return rows.map(({ roles, ...account }) => ({
          ...account,
          user_roles: roles.map((role) => ({ role })),
        }));
      }
      const { data, error } = await governanceTable<AdminAccount>("profiles")
        .select(
          "id, full_name, email, is_active, must_change_password, created_at, user_roles!inner(role)",
        )
        .in("user_roles.role", ["admin", "super_admin"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function isSuperAdminAccount(account: AdminAccount) {
  return (account.user_roles ?? []).some((r) => r.role === "super_admin");
}

/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */

export function useAdminInvitations() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["governance-invitations"],
    queryFn: async (): Promise<AdminInvitationRow[]> => {
      if (viaApi) return apiGet<AdminInvitationRow[]>("/admin/governance/invitations");
      const { data, error } = await governanceTable<AdminInvitationRow>("admin_invitations")
        .select(
          "id, email, invited_by, role, permission_keys, otp_expires_at, status, accepted_at, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      if (viaApi) {
        await apiPost(`/admin/governance/invitations/${invitationId}/revoke`, {});
        return;
      }
      await governanceRpc<void>("admin_invite_revoke", { p_invitation_id: invitationId });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["governance-invitations"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

/** The full permission catalogue, for building the grant/deny matrix. */
export function usePermissionCatalog() {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["governance-permission-catalog"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PermissionRow[]> => {
      if (viaApi) return apiGet<PermissionRow[]>("/admin/governance/permissions");
      const { data, error } = await governanceTable<PermissionRow>("permissions")
        .select("key, label, description, category")
        .order("category")
        .order("key");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Per-user overrides. Absence of a row means "inherit from the role". */
export function useUserPermissions(userId: string | null) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["governance-user-permissions", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UserPermissionRow[]> => {
      if (viaApi) {
        return apiGet<UserPermissionRow[]>(`/admin/governance/users/${userId}/permissions`);
      }
      const { data, error } = await governanceTable<UserPermissionRow>("user_permissions")
        .select("id, user_id, permission_key, granted, granted_by, created_at")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** `granted: null` clears the override and falls back to the role grant. */
export function useSetUserPermission() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      permissionKey: string;
      granted: boolean | null;
    }) => {
      if (viaApi) {
        await apiPut(
          `/admin/governance/users/${input.userId}/permissions/${encodeURIComponent(input.permissionKey)}`,
          { granted: input.granted },
        );
        return;
      }
      await governanceRpc<void>("admin_set_user_permission", {
        p_user_id: input.userId,
        p_permission_key: input.permissionKey,
        p_granted: input.granted,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["governance-user-permissions"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Elevated roles (always via the approval queue)                      */
/* ------------------------------------------------------------------ */

export function useRequestElevatedRole() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      role: "admin" | "super_admin";
      revoke?: boolean;
    }) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>(
          `/admin/governance/users/${input.userId}/elevated-role`,
          { role: input.role, revoke: input.revoke ?? false },
        );
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: "user_roles.grant_elevated" satisfies AdminRequestAction,
        p_payload: { user_id: input.userId, role: input.role, revoke: input.revoke ?? false },
      });
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Maker-checker                                                       */
/* ------------------------------------------------------------------ */

export interface ActionRequest extends AdminActionRequestRow {
  requester: { full_name: string | null; email: string | null } | null;
  reviewer: { full_name: string | null; email: string | null } | null;
}

type ApiActionRequest = AdminActionRequestRow & {
  requester_name: string | null;
  requester_email: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
};

export function useActionRequests(status?: AdminRequestStatus | "all") {
  const filter = status ?? "pending";
  const viaApi = useApiData();
  return useQuery({
    queryKey: ["governance-action-requests", filter],
    queryFn: async (): Promise<ActionRequest[]> => {
      if (viaApi) {
        const rows = await apiGet<ApiActionRequest[]>(
          `/admin/governance/requests?status=${filter}`,
        );
        return rows.map(
          ({ requester_name, requester_email, reviewer_name, reviewer_email, ...row }) => ({
            ...row,
            requester: { full_name: requester_name, email: requester_email },
            reviewer:
              row.reviewed_by === null ? null : { full_name: reviewer_name, email: reviewer_email },
          }),
        );
      }
      let query = governanceTable<ActionRequest>("admin_action_requests")
        .select(
          "id, action, payload, requested_by, requested_at, status, reviewed_by, reviewed_at, review_notes, executed_at, execution_error, created_at, updated_at, requester:profiles!requested_by(full_name, email), reviewer:profiles!reviewed_by(full_name, email)",
        )
        .order("requested_at", { ascending: false })
        .limit(200);
      if (filter !== "all") query = query.eq("status", filter);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Submit an action for a second admin to approve. */
export function useRequestAction() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: { action: AdminRequestAction; payload: Record<string, unknown> }) => {
      if (viaApi) {
        const result = await apiPost<{ requestId: string }>("/admin/governance/requests", input);
        return result.requestId;
      }
      return governanceRpc<string>("admin_request_action", {
        p_action: input.action,
        p_payload: input.payload,
      });
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] }),
  });
}

export function useReviewActionRequest() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (input: {
      requestId: string;
      approve: boolean;
      notes?: string | undefined;
    }) => {
      if (viaApi) {
        return apiPost<AdminActionRequestRow>(
          `/admin/governance/requests/${input.requestId}/review`,
          { approve: input.approve, ...(input.notes ? { notes: input.notes } : {}) },
        );
      }
      return governanceRpc<AdminActionRequestRow>("admin_review_action", {
        p_request_id: input.requestId,
        p_approve: input.approve,
        p_notes: input.notes ?? null,
      });
    },
    onSuccess: () => {
      // An approval executes the real effect, so everything it could have
      // touched has to be refetched.
      void queryClient.invalidateQueries({ queryKey: ["governance-action-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-admin-accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["governance-audit-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export interface AuditLogFilters {
  action?: string | undefined;
  entityType?: string | undefined;
  actorEmail?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const viaApi = useApiData();
  return useQuery({
    queryKey: [
      "governance-audit-logs",
      filters.action ?? null,
      filters.entityType ?? null,
      filters.actorEmail ?? null,
      filters.from ?? null,
      filters.to ?? null,
    ],
    queryFn: async (): Promise<AuditLogRow[]> => {
      if (viaApi) {
        const query = new URLSearchParams();
        if (filters.action) query.set("action", filters.action);
        if (filters.entityType) query.set("entityType", filters.entityType);
        if (filters.actorEmail) query.set("actorEmail", filters.actorEmail);
        if (filters.from) query.set("from", filters.from);
        if (filters.to) query.set("to", filters.to);
        return apiGet<AuditLogRow[]>(`/admin/governance/audit-logs?${query.toString()}`);
      }
      let query = governanceTable<AuditLogRow>("audit_logs")
        .select(
          "id, actor_id, actor_email, action, entity_type, entity_id, before, after, metadata, ip, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(300);

      if (filters.action) query = query.ilike("action", `%${filters.action}%`);
      if (filters.entityType) query = query.eq("entity_type", filters.entityType);
      if (filters.actorEmail) query = query.ilike("actor_email", `%${filters.actorEmail}%`);
      if (filters.from) query = query.gte("created_at", filters.from);
      if (filters.to) query = query.lte("created_at", filters.to);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Own account security                                                */
/* ------------------------------------------------------------------ */

/**
 * Sets a new password, then clears the forced-change flag.
 *
 * Under the API the current password is required, and changing it signs out
 * every session — so this signs straight back in with the new one, keeping the
 * admin where they are. The API clears the forced-change flag itself.
 */
export function useChangeOwnPassword() {
  const queryClient = useQueryClient();
  const viaApi = useApiData();
  return useMutation({
    mutationFn: async (
      input: string | { password: string; currentPassword: string; email: string },
    ) => {
      if (viaApi) {
        if (typeof input === "string") throw new Error("Enter your current password.");
        await apiPost("/auth/password/change", {
          currentPassword: input.currentPassword,
          newPassword: input.password,
        });
        const { error } = await authClient.signInWithPassword({
          email: input.email,
          password: input.password,
        });
        if (error) throw error;
        return;
      }
      const password = typeof input === "string" ? input : input.password;
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await governanceRpc<void>("clear_must_change_password");
    },
    onSuccess: () => void queryClient.invalidateQueries(),
  });
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

export const REQUEST_ACTION_LABEL: Record<AdminRequestAction, string> = {
  "payment.refund": "Refund payment",
  "booking.cancel_with_refund": "Cancel booking with refund",
  "payout.settle": "Settle payout",
  "user_roles.grant_elevated": "Change admin role",
  "profile.suspend": "Suspend or restore account",
};

export const REQUEST_STATUS_LABEL: Record<AdminRequestStatus, string> = {
  pending: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
  executed: "Applied",
  failed: "Failed",
};

export const REQUEST_STATUS_TONE: Record<AdminRequestStatus, string> = {
  pending: "bg-secondary-soft text-foreground",
  approved: "bg-primary-soft text-primary-deep",
  rejected: "bg-muted text-muted-foreground",
  executed: "bg-success/12 text-success",
  failed: "bg-destructive/12 text-destructive",
};

export const INVITATION_STATUS_LABEL: Record<string, string> = {
  pending: "Waiting to be accepted",
  accepted: "Accepted",
  revoked: "Revoked",
  expired: "Expired",
};

export const INVITATION_STATUS_TONE: Record<string, string> = {
  pending: "bg-secondary-soft text-foreground",
  accepted: "bg-success/12 text-success",
  revoked: "bg-muted text-muted-foreground",
  expired: "bg-destructive/12 text-destructive",
};

/**
 * The governance RPCs raise bare SCREAMING_SNAKE codes. This turns them into
 * sentences, matching how the auth forms map Supabase's own error strings.
 */
export function friendlyAdminError(error: unknown): string {
  const raw = String((error as { message?: string } | null)?.message ?? error ?? "").toUpperCase();

  if (raw.includes("SELF_APPROVAL_FORBIDDEN"))
    return "You raised this request, so someone else has to approve it.";
  if (raw.includes("SELF_ROLE_GRANT_FORBIDDEN")) return "You can't change your own roles.";
  if (raw.includes("SELF_SUSPEND_FORBIDDEN")) return "You can't suspend your own account.";
  if (raw.includes("ELEVATED_ROLE_REQUIRES_SUPER_ADMIN"))
    return "Only a super admin can grant or remove admin access.";
  if (raw.includes("ELEVATED_ROLE_REQUIRES_APPROVAL"))
    return "Admin access is changed in Admins & roles, where it goes for approval.";
  if (raw.includes("LAST_SUPER_ADMIN_PROTECTED"))
    return "This is the last super admin. Promote someone else before removing this one.";
  if (raw.includes("REQUEST_ALREADY_REVIEWED")) return "Someone already reviewed this request.";
  if (raw.includes("REQUEST_NOT_FOUND")) return "That request no longer exists.";
  if (raw.includes("INVITATION_EXPIRED")) return "That invitation has expired. Ask for a new one.";
  if (raw.includes("INVITATION_NOT_FOUND"))
    return "We couldn't find a pending invitation for that address.";
  if (raw.includes("INVALID_OTP"))
    return "That one-time password isn't right. Check your invitation email.";
  if (raw.includes("EMAIL_MISMATCH"))
    return "You're signed in as a different account than the one invited.";
  if (raw.includes("EMAIL_DOMAIN_NOT_ALLOWED"))
    return "That email domain isn't on the allowed list for admin invitations.";
  if (raw.includes("INVITE_DOMAIN_ALLOWLIST_EMPTY"))
    return "No invite domains are configured yet. Add one in Platform settings first.";
  if (raw.includes("PAYMENT_NOT_REFUNDABLE")) return "That payment can no longer be refunded.";
  if (raw.includes("PAYOUT_NOT_SETTLEABLE")) return "That payout is no longer awaiting settlement.";
  if (raw.includes("PAYOUT_NOT_REJECTABLE")) return "That payout is no longer awaiting a decision.";
  if (raw.includes("NOT_AUTHORIZED")) return "You don't have permission to do that.";
  if (raw.includes("NETWORK") || raw.includes("FETCH"))
    return "Something went wrong. Please check your connection and try again.";

  return "We couldn't complete that just now. Please try again.";
}

/** Turns an audit action key like `user_roles.insert` into readable text. */
export function humanizeAuditAction(action: string) {
  const parts = action.split(".");
  const entity = parts[0] ?? action;
  const verb = parts[1];
  if (!verb) return action;

  const entityLabel = entity.replace(/_/g, " ");
  const verbLabel =
    verb === "insert"
      ? "created"
      : verb === "update"
        ? "updated"
        : verb === "delete"
          ? "deleted"
          : verb;
  return `${entityLabel.charAt(0).toUpperCase()}${entityLabel.slice(1)} ${verbLabel}`;
}

function field(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return value === null || value === undefined ? "" : String(value);
}

function shortId(payload: Record<string, unknown>, key: string) {
  return field(payload, key).slice(0, 8) || "—";
}

/** One-line summary of a request payload for the approvals table. */
export function summarizeRequestPayload(
  action: AdminRequestAction,
  payload: Record<string, unknown>,
) {
  switch (action) {
    case "payment.refund":
      return `Refund ${field(payload, "amount") || "?"} on payment ${shortId(payload, "payment_id")}`;
    case "booking.cancel_with_refund":
      return `Booking ${shortId(payload, "booking_id")} — ${field(payload, "reason") || "no reason given"}`;
    case "payout.settle":
      return `Payout ${shortId(payload, "payout_id")}`;
    case "user_roles.grant_elevated":
      return `${payload["revoke"] ? "Remove" : "Grant"} ${field(payload, "role")} for ${shortId(payload, "user_id")}`;
    case "profile.suspend":
      return `${payload["is_active"] ? "Restore" : "Suspend"} account ${shortId(payload, "profile_id")}`;
    default:
      return JSON.stringify(payload);
  }
}

/* ------------------------------------------------------------------ */
/* Invitations: create and redeem through the API                       */
/* ------------------------------------------------------------------ */

export type ApiInviteResult = {
  invitationId: string;
  emailed: boolean;
  expiresAt: string;
  otp?: string;
};

/** Super admin: create an invitation; the API emails the one-time code. */
export async function inviteAdminViaApi(input: {
  email: string;
  role: "admin" | "super_admin";
  permissionKeys: string[];
}): Promise<ApiInviteResult> {
  return apiPost<ApiInviteResult>("/admin/governance/invitations", input);
}

/** The invitee, signed in as the invited address, redeems their code. */
export async function redeemInvitationViaApi(email: string, otp: string): Promise<void> {
  await apiPost("/invitations/redeem", { email, otp });
}

/** PUT with the session token; data-client has no apiPut. */
async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const { data } = await authClient.getSession();
  const accessToken = data.session?.access_token;
  return apiRequest<T>(path, { method: "PUT", body, ...(accessToken ? { accessToken } : {}) });
}
