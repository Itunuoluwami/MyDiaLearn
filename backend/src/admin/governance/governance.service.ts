import { Inject, Injectable, Logger } from '@nestjs/common';

import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { authConfig, type AuthConfig } from '../../config/configuration';
import { EmailService } from '../../integrations/email/email.service';
import { translateAdminError } from '../admin-errors';
import { GovernanceRepository } from './governance.repository';

type Row = Record<string, unknown>;

const ROLE_LABEL: Record<string, string> = { admin: 'an admin', super_admin: 'a super admin' };

/**
 * Admin governance. The rules — who may invite, approve, grant — live in the
 * governance functions; this service calls them, sends the invitation email
 * the database cannot send, audits, and turns refusal codes into 4xx.
 */
@Injectable()
export class GovernanceService {
  private readonly logger = new Logger(GovernanceService.name);

  constructor(
    private readonly repository: GovernanceRepository,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  async adminAccounts(adminId: string): Promise<Row[]> {
    return this.repository.adminAccounts(adminId);
  }

  async invitations(adminId: string): Promise<Row[]> {
    return this.repository.invitations(adminId);
  }

  /**
   * Creates the invitation and emails the one-time code.
   *
   * The code is returned to the super admin only when the email could not be
   * sent, so they can pass it on another way — the same fallback the Supabase
   * flow had for an address that already had an account. It is never logged.
   */
  async invite(
    adminId: string,
    input: { email: string; role: 'admin' | 'super_admin'; permissionKeys: string[] },
    context: AuditContext,
  ): Promise<{ invitationId: string; emailed: boolean; expiresAt: string; otp?: string }> {
    const email = input.email.trim().toLowerCase();
    let created;
    try {
      created = await this.repository.createInvitation(adminId, {
        email,
        role: input.role,
        permissionKeys: input.permissionKeys,
      });
    } catch (error) {
      throw translateAdminError(error, 'We could not create that invitation.');
    }

    const expiresAt = new Date(created.expires_at);
    const acceptUrl = `${this.config.appUrl}/auth/accept-invite?email=${encodeURIComponent(email)}`;
    const sent = await this.email.sendTemplate({
      trigger: 'admin.invitation',
      to: email,
      vars: {
        role: ROLE_LABEL[input.role] ?? input.role,
        otp: created.otp,
        expires_at: expiresAt.toUTCString(),
        accept_url: acceptUrl,
      },
    });
    // The log provider "succeeds" without sending anything, so treat it as not
    // emailed and hand the code back rather than leave the invitee without it.
    const emailed = sent !== null && this.email.providerName !== 'log';
    if (!emailed) {
      this.logger.warn(
        'Admin invitation email was not sent; returning the code to the inviter.',
      );
    }

    await this.audit.record('admin.invite_created', {
      actorId: adminId,
      entityType: 'admin_invitation',
      entityId: created.invitation_id,
      context,
      metadata: { role: input.role, permissions: input.permissionKeys.length, emailed },
    });

    return {
      invitationId: created.invitation_id,
      emailed,
      expiresAt: expiresAt.toISOString(),
      ...(emailed ? {} : { otp: created.otp }),
    };
  }

  async revokeInvitation(
    adminId: string,
    invitationId: string,
    context: AuditContext,
  ): Promise<void> {
    await this.call(() => this.repository.revokeInvitation(adminId, invitationId));
    await this.audit.record('admin.invite_revoked', {
      actorId: adminId,
      entityType: 'admin_invitation',
      entityId: invitationId,
      context,
    });
  }

  async redeemInvitation(userId: string, email: string, otp: string): Promise<void> {
    await this.call(() =>
      this.repository.redeemInvitation(userId, email.trim().toLowerCase(), otp.trim()),
    );
  }

  async permissionCatalog(adminId: string): Promise<Row[]> {
    return this.repository.permissionCatalog(adminId);
  }

  async userPermissions(adminId: string, userId: string): Promise<Row[]> {
    return this.repository.userPermissions(adminId, userId);
  }

  async setUserPermission(
    adminId: string,
    userId: string,
    key: string,
    granted: boolean | null,
    context: AuditContext,
  ): Promise<void> {
    await this.call(() => this.repository.setUserPermission(adminId, userId, key, granted));
    await this.audit.record('user.permission_changed', {
      actorId: adminId,
      entityType: 'profile',
      entityId: userId,
      context,
      metadata: { permissionKey: key, granted },
    });
  }

  async requestAction(
    adminId: string,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<{ requestId: string }> {
    const requestId = await this.call(() =>
      this.repository.requestAction(adminId, action, payload),
    );
    return { requestId };
  }

  async actionRequests(adminId: string, status: string): Promise<Row[]> {
    return this.repository.actionRequests(adminId, status);
  }

  async reviewAction(
    adminId: string,
    requestId: string,
    input: { approve: boolean; notes?: string | undefined },
    context: AuditContext,
  ): Promise<Row> {
    const result = await this.call(() =>
      this.repository.reviewAction(
        adminId,
        requestId,
        input.approve,
        input.notes?.trim() || null,
      ),
    );
    await this.audit.record('admin.action_reviewed', {
      actorId: adminId,
      entityType: 'admin_action_request',
      entityId: requestId,
      context,
      metadata: { approve: input.approve, status: result['status'] ?? null },
    });
    return result;
  }

  async auditLogs(
    adminId: string,
    query: {
      action?: string | undefined;
      entityType?: string | undefined;
      actorEmail?: string | undefined;
      from?: string | undefined;
      to?: string | undefined;
    },
  ): Promise<Row[]> {
    return this.repository.auditLogs(adminId, {
      action: query.action?.trim() || null,
      entityType: query.entityType?.trim() || null,
      actorEmail: query.actorEmail?.trim() || null,
      from: query.from ? new Date(query.from) : null,
      to: query.to ? new Date(query.to) : null,
    });
  }

  private async call<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw translateAdminError(error, 'We could not complete that just now.');
    }
  }
}
