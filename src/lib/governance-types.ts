/**
 * Row and payload shapes for the admin-governance surface: audit log,
 * admin invitations, two-approver action requests and the permission matrix.
 *
 * These used to live in `src/integrations/supabase/governance-types.ts`, which
 * declared them alongside two `supabase.rpc` / `supabase.from` escape hatches
 * for tables the generated types did not know about. The governance screens
 * now read the NestJS API, so only the shapes are left — and they are owned
 * here, by the app, rather than derived from a database codegen artefact.
 */

import type { AdminInvitationStatus, AdminRequestStatus, AppRole } from "@/lib/domain-types";

export type { AdminInvitationStatus, AdminRequestStatus };

/** Admin screens speak in the same role vocabulary as the rest of the app. */
export type GovernanceRole = AppRole;

/** The five actions that require a second approver. */
export type AdminRequestAction =
  | "payment.refund"
  | "booking.cancel_with_refund"
  | "payout.settle"
  | "user_roles.grant_elevated"
  | "profile.suspend";

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}

export interface AdminInvitationRow {
  id: string;
  email: string;
  invited_by: string | null;
  role: GovernanceRole;
  permission_keys: string[];
  otp_expires_at: string;
  status: AdminInvitationStatus;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminActionRequestRow {
  id: string;
  action: AdminRequestAction;
  payload: Record<string, unknown>;
  requested_by: string;
  requested_at: string;
  status: AdminRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  executed_at: string | null;
  execution_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPermissionRow {
  id: string;
  user_id: string;
  permission_key: string;
  granted: boolean;
  granted_by: string | null;
  created_at: string;
}

export interface PermissionRow {
  key: string;
  label: string;
  description: string | null;
  category: string;
}
