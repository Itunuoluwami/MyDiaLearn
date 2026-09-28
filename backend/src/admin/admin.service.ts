import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotFoundError } from '../common/exceptions/app.exception';
import { translateAdminError } from './admin-errors';
import { AdminRepository } from './admin.repository';

/**
 * The admin portal's operations.
 *
 * Nothing here decides a business rule. Suspensions go to the approval queue
 * that admin_request_action() owns; verification outcomes are plain status
 * writes the verification trigger already governs; the hourly-rate change is
 * checked by its own trigger. This layer orders the calls, audits the ones
 * the database does not, and shapes responses.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly repository: AdminRepository,
    private readonly audit: AuditService,
  ) {}

  async dashboard(adminId: string): Promise<Record<string, unknown> | null> {
    return this.repository.dashboardSummary(adminId);
  }

  async users(
    adminId: string,
    query: { search?: string; role?: string; from?: string; to?: string },
  ): Promise<Record<string, unknown>[]> {
    const rows = await this.repository.listUsers(adminId, {
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.from ? { from: new Date(query.from) } : {}),
      ...(query.to ? { to: new Date(query.to) } : {}),
    });
    return rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      primaryRole: row.primary_role,
      isActive: row.is_active,
      onboardingCompleted: row.onboarding_completed,
      createdAt: row.created_at.toISOString(),
      roles: row.roles ?? [],
    }));
  }

  /** Suspending or restoring access needs a second admin's approval. */
  async requestSuspension(
    adminId: string,
    profileId: string,
    isActive: boolean,
  ): Promise<{ requestId: string }> {
    try {
      const requestId = await this.repository.requestAction(adminId, 'profile.suspend', {
        profile_id: profileId,
        is_active: isActive,
      });
      return { requestId };
    } catch (error) {
      throw translateAdminError(error, 'We could not submit that request.');
    }
  }

  async verificationQueue(
    adminId: string,
    status: string,
  ): Promise<Record<string, unknown>[]> {
    const rows = await this.repository.verificationQueue(adminId, status);
    return rows.map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      headline: row.headline,
      verificationStatus: row.verification_status,
      isListed: row.is_listed,
      submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
      yearsExperience: row.years_experience,
      hourlyRate: row.hourly_rate === null ? null : String(row.hourly_rate),
      currency: row.currency,
      fullName: row.full_name,
      email: row.email,
      avatarUrl: row.avatar_url,
    }));
  }

  async verificationDetail(
    adminId: string,
    tutorId: string,
  ): ReturnType<AdminRepository['verificationDetail']> {
    return this.repository.verificationDetail(adminId, tutorId);
  }

  async reviewStep(
    adminId: string,
    input: {
      tutorId: string;
      stepId: string;
      status: string;
      reviewerNotes?: string | undefined;
    },
  ): Promise<void> {
    try {
      await this.repository.reviewStep(adminId, {
        tutorId: input.tutorId,
        stepId: input.stepId,
        status: input.status,
        reviewerNotes: input.reviewerNotes?.trim() || null,
      });
    } catch (error) {
      throw translateAdminError(error, 'We could not save that review.');
    }
  }

  async reviewDocument(
    adminId: string,
    input: { documentId: string; status: string; reviewerNotes?: string | undefined },
  ): Promise<void> {
    const found = await this.repository.reviewDocument(adminId, {
      documentId: input.documentId,
      status: input.status,
      reviewerNotes: input.reviewerNotes?.trim() || null,
    });
    if (!found) throw new NotFoundError('Document');
  }

  async approveTutor(adminId: string, tutorId: string, context: AuditContext): Promise<void> {
    if (!(await this.repository.setTutorVerification(adminId, tutorId, 'verified'))) {
      throw new NotFoundError('Tutor');
    }
    await this.audit.record('tutor.verification_approved', {
      actorId: adminId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
    });
  }

  async rejectTutor(
    adminId: string,
    tutorId: string,
    reason: string | undefined,
    context: AuditContext,
  ): Promise<void> {
    if (!(await this.repository.setTutorVerification(adminId, tutorId, 'rejected'))) {
      throw new NotFoundError('Tutor');
    }
    await this.audit.record('tutor.verification_rejected', {
      actorId: adminId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
      metadata: { hasReason: Boolean(reason?.trim()) },
    });
  }

  async setHourlyRate(
    adminId: string,
    tutorId: string,
    hourlyRate: number,
    context: AuditContext,
  ): Promise<void> {
    let result;
    try {
      result = await this.repository.setHourlyRate(adminId, tutorId, hourlyRate);
    } catch (error) {
      throw translateAdminError(error, 'We could not change that rate.');
    }
    if (!result) throw new NotFoundError('Tutor');
    await this.audit.record('tutor.rate_changed', {
      actorId: adminId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
      metadata: {
        from: result.previous === null ? null : String(result.previous),
        to: hourlyRate.toFixed(2),
        currency: result.currency,
      },
    });
  }
}
