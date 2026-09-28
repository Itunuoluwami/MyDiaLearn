import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';

type Row = Record<string, unknown>;

/**
 * Admin governance: accounts, invitations, permissions, the maker-checker
 * queue and the audit trail.
 *
 * Every write is a call into the governance functions, which enforce who may
 * do what (is_super_admin, has_permission, self-approval, last super admin)
 * using the caller's claims. This repository never touches user_roles or
 * admin_action_requests directly.
 */
@Injectable()
export class GovernanceRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async adminAccounts(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select p.id, p.full_name, p.email, p.is_active, p.must_change_password, p.created_at,
               array_agg(ur.role::text order by ur.role::text) as roles
        from public.profiles p
        join public.user_roles ur on ur.user_id = p.id and ur.role in ('admin', 'super_admin')
        group by p.id
        order by p.created_at desc
      `,
    );
  }

  async invitations(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, email, invited_by, role::text, permission_keys, otp_expires_at, status::text,
               accepted_at, created_at, updated_at
        from public.admin_invitations
        order by created_at desc
        limit 100
      `,
    );
  }

  /** Returns the plaintext code exactly once; only its hash is stored. */
  async createInvitation(
    adminId: string,
    input: { email: string; role: string; permissionKeys: string[] },
  ): Promise<{ invitation_id: string; otp: string; expires_at: Date }> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<
        { invitation_id: string; otp: string; expires_at: Date }[]
      >`
        select * from public.admin_invite_create(
          ${input.email}, ${input.role}::public.app_role, ${input.permissionKeys}::text[]
        )
      `;
      return rows[0]!;
    });
  }

  async revokeInvitation(adminId: string, invitationId: string): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`select public.admin_invite_revoke(${invitationId}::uuid)`;
    });
  }

  /** admin_invite_redeem() checks the caller is signed in as the invited address. */
  async redeemInvitation(userId: string, email: string, otp: string): Promise<void> {
    await this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`select public.admin_invite_redeem(${email}, ${otp})`;
    });
  }

  async permissionCatalog(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select key, label, description, category from public.permissions order by category, key
      `,
    );
  }

  async userPermissions(adminId: string, userId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, user_id, permission_key, granted, granted_by, created_at
        from public.user_permissions where user_id = ${userId}::uuid
      `,
    );
  }

  async setUserPermission(
    adminId: string,
    userId: string,
    key: string,
    granted: boolean | null,
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        select public.admin_set_user_permission(${userId}::uuid, ${key}, ${granted}::boolean)
      `;
    });
  }

  async requestAction(adminId: string, action: string, payload: object): Promise<string> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        select public.admin_request_action(${action}, ${JSON.stringify(payload)}::jsonb) as id
      `;
      return rows[0]!.id;
    });
  }

  async actionRequests(adminId: string, status: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select r.id, r.action, r.payload, r.requested_by, r.requested_at, r.status::text,
               r.reviewed_by, r.reviewed_at, r.review_notes, r.executed_at, r.execution_error,
               r.created_at, r.updated_at,
               rq.full_name as requester_name, rq.email as requester_email,
               rv.full_name as reviewer_name, rv.email as reviewer_email
        from public.admin_action_requests r
        left join public.profiles rq on rq.id = r.requested_by
        left join public.profiles rv on rv.id = r.reviewed_by
        where ${status} = 'all' or r.status::text = ${status}
        order by r.requested_at desc
        limit 200
      `,
    );
  }

  /**
   * Approving runs the action through admin_execute_action() inside the
   * function, in this transaction; a failure is recorded on the request.
   */
  async reviewAction(
    adminId: string,
    requestId: string,
    approve: boolean,
    notes: string | null,
  ): Promise<Row> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<Row[]>`
        select id, action, status::text, reviewed_at, executed_at, execution_error
        from public.admin_review_action(${requestId}::uuid, ${approve}, ${notes}::text)
      `;
      return rows[0]!;
    });
  }

  async auditLogs(
    adminId: string,
    filters: {
      action: string | null;
      entityType: string | null;
      actorEmail: string | null;
      from: Date | null;
      to: Date | null;
    },
  ): Promise<Row[]> {
    const action = filters.action ? `%${filters.action}%` : null;
    const actor = filters.actorEmail ? `%${filters.actorEmail}%` : null;
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, actor_id, actor_email, action, entity_type, entity_id, before, after,
               metadata, ip, created_at
        from public.audit_logs
        where (${action}::text is null or action ilike ${action})
          and (${filters.entityType}::text is null or entity_type = ${filters.entityType})
          and (${actor}::text is null or actor_email ilike ${actor})
          and (${filters.from}::timestamptz is null or created_at >= ${filters.from})
          and (${filters.to}::timestamptz is null or created_at <= ${filters.to})
        order by created_at desc
        limit 300
      `,
    );
  }
}
