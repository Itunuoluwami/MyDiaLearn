import { Module } from '@nestjs/common';

/**
 * Profiles, roles and resolved permissions.
 *
 * Replaces direct reads of profiles, user_roles, permissions, role_permissions
 * and user_permissions, and the my_permissions() / has_permission() / has_role()
 * / is_admin() / is_super_admin() functions.
 *
 * This module also owns admin governance: admin_invitations, admin_action_requests
 * (the two-person maker-checker over payment.refund, booking.cancel_with_refund,
 * payout.settle, user_roles.grant_elevated and profile.suspend) and audit_logs.
 * That is a compliance surface — it is ported before the admin write paths it
 * protects, not after.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class UsersModule {}
