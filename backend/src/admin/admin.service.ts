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
    return this.submit(adminId, 'profile.suspend', {
      profile_id: profileId,
      is_active: isActive,
    });
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

  // --- Bookings ----------------------------------------------------------------

  async bookings(
    adminId: string,
    query: { search?: string; status?: string; from?: string; to?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.repository.listBookings(adminId, {
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status && query.status !== 'all' ? { status: query.status } : {}),
      ...(query.from ? { from: new Date(query.from) } : {}),
      ...(query.to ? { to: new Date(query.to) } : {}),
    });
  }

  async overrideBookingStatus(
    adminId: string,
    bookingId: string,
    status: string,
  ): Promise<void> {
    let found: boolean;
    try {
      found = await this.repository.setBookingStatus(adminId, bookingId, status);
    } catch (error) {
      throw translateAdminError(error, 'We could not change that booking.');
    }
    if (!found) throw new NotFoundError('Booking');
  }

  /**
   * Cancellation with a refund needs a second admin. This submits the request;
   * admin_execute_action() runs admin_cancel_booking() once it is approved.
   */
  async requestCancellation(
    adminId: string,
    bookingId: string,
    input: { reason: string; refundPercentage?: number | undefined },
  ): Promise<{ requestId: string }> {
    return this.submit(adminId, 'booking.cancel_with_refund', {
      booking_id: bookingId,
      reason: input.reason,
      refund_percentage: input.refundPercentage ?? null,
    });
  }

  // --- Payments and payouts -----------------------------------------------------

  async payments(
    adminId: string,
    query: { status?: string; from?: string; to?: string },
  ): Promise<Record<string, unknown>[]> {
    return this.repository.listPayments(adminId, {
      ...(query.status ? { status: query.status } : {}),
      ...(query.from ? { from: new Date(query.from) } : {}),
      ...(query.to ? { to: new Date(query.to) } : {}),
    });
  }

  /** The amount is clamped to the payment at execution time, not now. */
  async requestRefund(
    adminId: string,
    paymentId: string,
    input: { amount: number; reason?: string | undefined },
  ): Promise<{ requestId: string }> {
    return this.submit(adminId, 'payment.refund', {
      payment_id: paymentId,
      amount: input.amount,
      reason: input.reason?.trim() || null,
    });
  }

  async payouts(adminId: string, status: string): Promise<Record<string, unknown>[]> {
    return this.repository.listPayouts(adminId, status);
  }

  /** Settling moves money out, so it needs a second approver. */
  async requestPayoutSettlement(
    adminId: string,
    payoutId: string,
  ): Promise<{ requestId: string }> {
    return this.submit(adminId, 'payout.settle', { payout_id: payoutId });
  }

  async rejectPayout(
    adminId: string,
    payoutId: string,
    notes: string | undefined,
  ): Promise<void> {
    try {
      await this.repository.rejectPayout(adminId, payoutId, notes?.trim() || null);
    } catch (error) {
      throw translateAdminError(error, 'We could not reject that payout.');
    }
  }

  // --- Disputes -----------------------------------------------------------------

  async disputes(adminId: string, status: string): Promise<Record<string, unknown>[]> {
    return this.repository.listDisputes(adminId, status);
  }

  async resolveDispute(
    adminId: string,
    disputeId: string,
    input: { status: string; notes?: string | undefined },
    context: AuditContext,
  ): Promise<void> {
    try {
      await this.repository.resolveDispute(adminId, {
        disputeId,
        status: input.status,
        notes: input.notes?.trim() || null,
      });
    } catch (error) {
      throw translateAdminError(error, 'We could not update that dispute.');
    }
    await this.audit.record('dispute.resolved', {
      actorId: adminId,
      entityType: 'dispute',
      entityId: disputeId,
      context,
      metadata: { status: input.status },
    });
  }

  private async submit(
    adminId: string,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<{ requestId: string }> {
    try {
      return { requestId: await this.repository.requestAction(adminId, action, payload) };
    } catch (error) {
      throw translateAdminError(error, 'We could not submit that request.');
    }
  }
}
