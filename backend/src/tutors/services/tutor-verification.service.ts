import { Inject, Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { AppException, ErrorCode, NotFoundError } from '../../common/exceptions/app.exception';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../../integrations/storage/storage.interface';
import type {
  AddTutorDocumentDto,
  TutorDocumentResponse,
  VerificationStepResponse,
} from '../dto/tutor.dto';
import {
  TutorVerificationRepository,
  type TutorDocumentRow,
  type VerificationStepRow,
} from '../tutor-verification.repository';
import { TutorsRepository } from '../tutors.repository';

const DOCUMENTS_BUCKET = 'tutor-documents';

/**
 * Tutor verification workflow.
 *
 * The *gate* — an unverified tutor is not listed and not bookable — is enforced
 * by the enforce_tutor_verification_rules trigger and by the public_* search
 * functions. It applies to every client, so it cannot be bypassed by an
 * endpoint that forgets to check, and it is not reimplemented here.
 *
 * What this owns is the path to that gate: which steps exist, which documents
 * have been supplied, and submission for review.
 */
@Injectable()
export class TutorVerificationService {
  constructor(
    private readonly repository: TutorVerificationRepository,
    private readonly tutors: TutorsRepository,
    private readonly audit: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async steps(userId: string): Promise<VerificationStepResponse[]> {
    const tutor = await this.tutors.ensureOwn(userId);
    const rows = await this.repository.steps(userId, tutor.id);
    return rows.map(toStepResponse);
  }

  async documents(userId: string): Promise<TutorDocumentResponse[]> {
    const tutor = await this.tutors.ensureOwn(userId);
    const rows = await this.repository.documents(userId, tutor.id);
    return rows.map(toDocumentResponse);
  }

  async addDocument(
    userId: string,
    dto: AddTutorDocumentDto,
    context: AuditContext,
  ): Promise<TutorDocumentResponse> {
    const tutor = await this.tutors.ensureOwn(userId);

    // The storage key is supplied by the caller, so it has to be confined to
    // their own namespace. Without this a tutor could register a row pointing
    // at another tutor's document and then have a signed URL minted for it —
    // the table's RLS policy checks tutor_id, not the path inside it.
    assertOwnedPath(dto.storagePath, tutor.id);

    const row = await this.repository.addDocument(userId, {
      tutorId: tutor.id,
      stepId: dto.stepId,
      label: dto.label,
      storagePath: dto.storagePath,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
    });

    await this.audit.record('tutor.document_uploaded', {
      actorId: userId,
      entityType: 'tutor_document',
      entityId: row.id,
      context,
      metadata: { tutorId: tutor.id, label: dto.label, stepId: dto.stepId ?? null },
    });

    return toDocumentResponse(row);
  }

  async removeDocument(
    userId: string,
    documentId: string,
    context: AuditContext,
  ): Promise<void> {
    const storagePath = await this.repository.removeDocument(userId, documentId);
    if (!storagePath) throw new NotFoundError('Document');

    // The row is gone either way. A storage provider that is unconfigured —
    // which it is today, since files still belong to Supabase — must not turn
    // a successful delete into an error the tutor sees.
    try {
      await this.storage.remove(DOCUMENTS_BUCKET, [storagePath]);
    } catch {
      // Intentionally swallowed; the orphaned object is a housekeeping matter,
      // not something the caller can act on.
    }

    await this.audit.record('tutor.document_removed', {
      actorId: userId,
      entityType: 'tutor_document',
      entityId: documentId,
      context,
    });
  }

  /**
   * Submits for review.
   *
   * tutor_submit_verification() decides whether the submission is complete and
   * what status results. Its verdict is returned rather than a locally
   * computed one, so "ready for review" has a single definition.
   */
  async submit(userId: string, context: AuditContext): Promise<{ status: string }> {
    const tutor = await this.tutors.ensureOwn(userId);

    let status: string;
    try {
      status = await this.repository.submit(userId);
    } catch (error) {
      throw translateVerificationError(error);
    }

    await this.audit.record('tutor.verification_submitted', {
      actorId: userId,
      entityType: 'tutor',
      entityId: tutor.id,
      context,
      metadata: { status },
    });

    return { status };
  }
}

/** Storage keys are `<tutorId>/<uuid>.<ext>`, matching the existing uploads. */
function assertOwnedPath(storagePath: string, tutorId: string): void {
  if (!storagePath.startsWith(`${tutorId}/`) || storagePath.includes('..')) {
    throw new AppException(
      ErrorCode.NOT_AUTHORIZED,
      'That document does not belong to your profile.',
      403,
    );
  }
}

export function translateVerificationError(error: unknown): AppException {
  const message = error instanceof Error ? error.message : String(error);

  if (/NOT_A_TUTOR/.test(message)) {
    return new AppException(ErrorCode.NOT_AUTHORIZED, 'This action is for tutors.', 403);
  }
  if (/INCOMPLETE|MISSING_STEP|REQUIRED/i.test(message)) {
    return new AppException(
      ErrorCode.VALIDATION_FAILED,
      'Please complete every required verification step before submitting.',
      400,
    );
  }
  if (/ALREADY_SUBMITTED|IN_REVIEW/i.test(message)) {
    return new AppException(
      ErrorCode.CONFLICT,
      'Your verification is already under review.',
      409,
    );
  }

  return new AppException(
    ErrorCode.INTERNAL_ERROR,
    'We could not submit your verification.',
    500,
  );
}

export function toStepResponse(row: VerificationStepRow): VerificationStepResponse {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    isRequired: row.is_required,
    sortOrder: row.sort_order,
    status: row.status,
    reviewerNotes: row.reviewer_notes,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
  };
}

/**
 * Document response.
 *
 * `storage_path` is deliberately not returned. It is an internal key, and the
 * only legitimate use for it is minting a signed URL — which is a separate,
 * authorised call rather than something a list response should enable.
 */
export function toDocumentResponse(row: TutorDocumentRow): TutorDocumentResponse {
  return {
    id: row.id,
    stepId: row.step_id,
    label: row.label,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    reviewerNotes: row.reviewer_notes,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}
