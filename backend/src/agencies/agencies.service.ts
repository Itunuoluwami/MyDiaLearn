import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { AuditService, type AuditContext } from '../common/audit/audit.service';
import {
  AppException,
  ErrorCode,
  NotAuthorizedError,
  NotFoundError,
} from '../common/exceptions/app.exception';
import { translateDatabaseError } from '../common/exceptions/database-errors';
import { TutorAvailabilityService } from '../tutors/services/tutor-availability.service';
import { TutorVerificationService } from '../tutors/services/tutor-verification.service';
import type { AddTutorDocumentDto } from '../tutors/dto/tutor.dto';
import { FilesService } from '../files/files.service';
import type { IncomingFile } from '../files/files.service';
import { TutorsService } from '../tutors/tutors.service';
import type { UpdateTutorProfileDto } from '../tutors/dto/tutor.dto';
import { AgenciesRepository, type AgencyRow } from './agencies.repository';
import type { UpdateAgencyDto } from './dto/agency.dto';

type Row = Record<string, unknown>;

/**
 * The agency portal.
 *
 * Managing a tutor reuses the tutor services unchanged: the agency's
 * ownership of the tutor is checked first, then the tutor operation runs as
 * that tutor, so every tutor rule in the database (verification transitions,
 * the admin-only hourly rate, subject and availability checks) applies to an
 * agency exactly as to the tutor. Each such action is also audited against
 * the agency owner, who is the one acting.
 */
@Injectable()
export class AgenciesService {
  constructor(
    private readonly repository: AgenciesRepository,
    private readonly auth: AuthService,
    private readonly tutors: TutorsService,
    private readonly availability: TutorAvailabilityService,
    private readonly verification: TutorVerificationService,
    private readonly files: FilesService,
    private readonly audit: AuditService,
  ) {}

  // --- The agency itself -----------------------------------------------------

  private async ownAgency(ownerId: string): Promise<AgencyRow> {
    const agency = await this.repository.findOrCreateOwn(ownerId);
    if (!agency) throw new NotFoundError('Agency');
    return agency;
  }

  async me(ownerId: string): Promise<Row> {
    const agency = await this.ownAgency(ownerId);
    const steps = await this.repository.verificationSteps(ownerId, agency.id);
    return { ...toAgency(agency), verificationSteps: steps };
  }

  async update(ownerId: string, dto: UpdateAgencyDto): Promise<Row> {
    await this.ownAgency(ownerId);
    const row = await this.repository.update(ownerId, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.registrationNumber !== undefined
        ? { registrationNumber: dto.registrationNumber?.trim() || null }
        : {}),
      ...(dto.countryCode !== undefined
        ? { countryCode: dto.countryCode?.trim().toUpperCase() || null }
        : {}),
      ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail || null } : {}),
      ...(dto.contactPhone !== undefined
        ? { contactPhone: dto.contactPhone?.trim() || null }
        : {}),
      ...(dto.website !== undefined ? { website: dto.website || null } : {}),
      ...(dto.about !== undefined ? { about: dto.about?.trim() || null } : {}),
    });
    if (!row) throw new NotFoundError('Agency');
    return toAgency(row);
  }

  async submitVerification(
    ownerId: string,
    context: AuditContext,
  ): Promise<{ status: string }> {
    const agency = await this.ownAgency(ownerId);
    const status = await this.call(() => this.repository.submitVerification(ownerId));
    await this.audit.record('agency.verification_submitted', {
      actorId: ownerId,
      entityType: 'agency',
      entityId: agency.id,
      context,
      metadata: { status },
    });
    return { status };
  }

  async dashboard(ownerId: string): Promise<Row> {
    const agency = await this.ownAgency(ownerId);
    const [counts, earnings] = await Promise.all([
      this.repository.dashboard(ownerId, agency.id),
      this.repository.earnings(ownerId),
    ]);
    return {
      agency: toAgency(agency),
      counts,
      earnings: earnings ? toEarnings(earnings) : null,
    };
  }

  // --- Tutors ------------------------------------------------------------------

  async roster(ownerId: string): Promise<Row[]> {
    await this.ownAgency(ownerId);
    const rows = await this.repository.roster(ownerId);
    return rows.map((r) => ({
      tutorId: r['tutor_id'],
      fullName: r['full_name'],
      email: r['email'],
      headline: r['headline'],
      verificationStatus: r['verification_status'],
      isListed: r['is_listed'],
      onboardingStep: r['onboarding_step'],
      submittedAt: r['submitted_at'] ?? null,
      lessonsCompleted: Number(r['lessons_completed'] ?? 0),
      grossAmount: String(r['gross_amount'] ?? '0'),
      tutorEarnings: String(r['tutor_earnings'] ?? '0'),
      agencyEarnings: String(r['agency_earnings'] ?? '0'),
      tutorPaidOut: String(r['tutor_paid_out'] ?? '0'),
      currency: r['currency'],
    }));
  }

  /**
   * Adds a tutor under the agency: creates their account (they are emailed a
   * link to set a password so they can teach), creates their tutor record,
   * and links it to the agency.
   */
  async addTutor(
    ownerId: string,
    input: { fullName: string; email: string; timezone?: string | undefined },
    context: AuditContext,
  ): Promise<{ tutorId: string; emailed: boolean }> {
    const agency = await this.ownAgency(ownerId);
    const account = await this.auth.provisionAccount(
      {
        email: input.email,
        fullName: input.fullName.trim(),
        role: 'tutor',
        timezone: input.timezone,
      },
      { agencyName: agency.name, actorId: ownerId },
      context,
    );
    const tutorId = await this.call(() => this.repository.ensureTutorRecord(account.userId));
    await this.call(() => this.repository.attachTutor(ownerId, tutorId));

    await this.audit.record('agency.tutor_added', {
      actorId: ownerId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
      metadata: { agencyId: agency.id, emailed: account.emailed },
    });
    return { tutorId, emailed: account.emailed };
  }

  /** Detaches a tutor; they keep their account and become independent. */
  async removeTutor(ownerId: string, tutorId: string, context: AuditContext): Promise<void> {
    if (!(await this.repository.detachTutor(ownerId, tutorId)))
      throw new NotFoundError('Tutor');
    await this.audit.record('agency.tutor_removed', {
      actorId: ownerId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
    });
  }

  /** Runs `operation` as the tutor, after checking the agency owns them. */
  private async asTutor<T>(
    ownerId: string,
    tutorId: string,
    operation: (tutorProfileId: string) => Promise<T>,
  ): Promise<T> {
    const profileId = await this.repository.ownedTutorProfile(ownerId, tutorId);
    if (!profileId) throw new NotFoundError('Tutor');
    return operation(profileId);
  }

  private async managed<T>(
    ownerId: string,
    tutorId: string,
    what: string,
    context: AuditContext,
    operation: (tutorProfileId: string) => Promise<T>,
  ): Promise<T> {
    const result = await this.asTutor(ownerId, tutorId, operation);
    await this.audit.record('agency.tutor_managed', {
      actorId: ownerId,
      entityType: 'tutor',
      entityId: tutorId,
      context,
      metadata: { what },
    });
    return result;
  }

  tutorProfile(ownerId: string, tutorId: string) {
    return this.asTutor(ownerId, tutorId, (pid) => this.tutors.me(pid));
  }

  updateTutorProfile(
    ownerId: string,
    tutorId: string,
    dto: UpdateTutorProfileDto,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'profile', context, (pid) =>
      this.tutors.updateMe(pid, dto, context),
    );
  }

  tutorSubjects(ownerId: string, tutorId: string) {
    return this.asTutor(ownerId, tutorId, (pid) => this.tutors.subjects(pid));
  }

  addTutorSubject(
    ownerId: string,
    tutorId: string,
    subjectId: string,
    educationLevelId: string | undefined,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'subject_added', context, (pid) =>
      this.tutors.addSubject(pid, subjectId, educationLevelId, context),
    );
  }

  removeTutorSubject(ownerId: string, tutorId: string, id: string, context: AuditContext) {
    return this.managed(ownerId, tutorId, 'subject_removed', context, (pid) =>
      this.tutors.removeSubject(pid, id),
    );
  }

  tutorAvailability(ownerId: string, tutorId: string) {
    return this.asTutor(ownerId, tutorId, (pid) => this.availability.listOwn(pid));
  }

  addTutorWindow(
    ownerId: string,
    tutorId: string,
    input: { dayOfWeek: number; startTime: string; endTime: string },
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'availability_added', context, (pid) =>
      this.availability.addWindow(pid, input),
    );
  }

  setTutorWindowActive(
    ownerId: string,
    tutorId: string,
    id: string,
    isActive: boolean,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'availability_toggled', context, (pid) =>
      this.availability.setWindowActive(pid, id, isActive),
    );
  }

  deleteTutorWindow(ownerId: string, tutorId: string, id: string, context: AuditContext) {
    return this.managed(ownerId, tutorId, 'availability_removed', context, (pid) =>
      this.availability.deleteWindow(pid, id),
    );
  }

  tutorVerification(ownerId: string, tutorId: string) {
    return this.asTutor(ownerId, tutorId, (pid) => this.verification.steps(pid));
  }

  submitTutorVerification(ownerId: string, tutorId: string, context: AuditContext) {
    return this.managed(ownerId, tutorId, 'verification_submitted', context, (pid) =>
      this.verification.submit(pid, context),
    );
  }

  /* --- Verification documents ----------------------------------------------
   *
   * An agency could submit a tutor for verification but had no way to attach
   * anything to the submission, so a reviewer opened the queue to a tutor with
   * no identity document, no qualifications and no background check. The
   * tutor's own portal has required five documents all along; this is the same
   * capability for the people who manage tutors on their behalf.
   *
   * All four reuse the tutor-side services unchanged, through `asTutor`, which
   * resolves the managed tutor's profile id only after proving the caller's
   * agency owns them. Every rule those services enforce — what may be
   * uploaded, where it lands, who may read it back — therefore still applies,
   * and an agency gets no path a tutor does not already have.
   */

  tutorDocuments(ownerId: string, tutorId: string) {
    return this.asTutor(ownerId, tutorId, (pid) => this.verification.documents(pid));
  }

  /**
   * Uploads the bytes into the managed tutor's own storage folder.
   *
   * `FilesService.upload` derives the folder from the tutor row belonging to
   * the id it is given, so passing the tutor's profile id puts the file
   * exactly where the tutor's own upload would have put it — not under the
   * agency owner, who has no tutor row and would be refused.
   */
  uploadTutorDocument(
    ownerId: string,
    tutorId: string,
    file: IncomingFile | undefined,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'document_uploaded', context, (pid) =>
      this.files.upload(pid, 'tutor-document', file),
    );
  }

  addTutorDocument(
    ownerId: string,
    tutorId: string,
    dto: AddTutorDocumentDto,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'document_added', context, (pid) =>
      this.verification.addDocument(pid, dto, context),
    );
  }

  removeTutorDocument(
    ownerId: string,
    tutorId: string,
    documentId: string,
    context: AuditContext,
  ) {
    return this.managed(ownerId, tutorId, 'document_removed', context, (pid) =>
      this.verification.removeDocument(pid, documentId, context),
    );
  }

  // --- Bookings and money --------------------------------------------------------

  async bookings(
    ownerId: string,
    query: { status?: string | undefined; from?: string | undefined; to?: string | undefined },
  ): Promise<Row[]> {
    await this.ownAgency(ownerId);
    return this.repository.bookings(ownerId, {
      status: query.status && query.status !== 'all' ? query.status : null,
      from: query.from ? new Date(query.from) : null,
      to: query.to ? new Date(query.to) : null,
    });
  }

  async earnings(ownerId: string): Promise<Row | null> {
    await this.ownAgency(ownerId);
    const row = await this.repository.earnings(ownerId);
    return row ? toEarnings(row) : null;
  }

  async payouts(ownerId: string): Promise<Row[]> {
    await this.ownAgency(ownerId);
    return this.repository.payouts(ownerId);
  }

  async requestPayout(
    ownerId: string,
    amount: number,
    context: AuditContext,
  ): Promise<{ id: string }> {
    const agency = await this.ownAgency(ownerId);
    const id = await this.call(() => this.repository.requestPayout(ownerId, amount));
    await this.audit.record('agency.payout_requested', {
      actorId: ownerId,
      entityType: 'payout',
      entityId: id,
      context,
      metadata: { agencyId: agency.id, amount: amount.toFixed(2) },
    });
    return { id };
  }

  private async call<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/INSUFFICIENT_BALANCE/.test(message)) {
        throw new AppException(
          ErrorCode.VALIDATION_FAILED,
          'That is more than your available balance.',
          400,
        );
      }
      if (/AGENCY_LINK_FORBIDDEN|NOT_AN_AGENCY/.test(message)) {
        throw new NotAuthorizedError('That tutor is not part of your agency.');
      }
      throw translateDatabaseError(error, 'We could not complete that for your agency.');
    }
  }
}

function toAgency(row: AgencyRow): Row {
  return {
    id: row.id,
    name: row.name,
    registrationNumber: row.registration_number,
    countryCode: row.country_code,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    website: row.website,
    about: row.about,
    logoUrl: row.logo_url,
    verificationStatus: row.verification_status,
    isActive: row.is_active,
    revenueSharePercentage: String(row.revenue_share_percentage),
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

function toEarnings(row: Row): Row {
  const str = (v: unknown) => String(v ?? '0');
  return {
    currency: row['currency'],
    grossRevenue: str(row['gross_revenue']),
    agencyEarnings: str(row['agency_earnings']),
    pendingEarnings: str(row['pending_earnings']),
    paidOut: str(row['paid_out']),
    pendingPayouts: str(row['pending_payouts']),
    availableBalance: str(row['available_balance']),
    revenueSharePercentage: str(row['revenue_share_percentage']),
    minimumPayout: str(row['minimum_payout']),
    nextPayoutDate: row['next_payout_date'] ?? null,
    scheduleLabel: row['schedule_label'] ?? null,
  };
}
