import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

export interface VerificationStepRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_required: boolean;
  sort_order: number;
  status: string | null;
  reviewer_notes: string | null;
  reviewed_at: Date | null;
}

export interface TutorDocumentRow {
  id: string;
  tutor_id: string;
  step_id: string | null;
  label: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

/**
 * Tutor verification.
 *
 * The gate itself is not here. enforce_tutor_verification_rules() and the
 * public_* search functions decide whether a tutor is listed and bookable, and
 * they run regardless of which client is calling — so an unverified tutor
 * cannot be surfaced by adding an endpoint that forgets to check.
 *
 * What this owns is the workflow around that gate: which steps exist, which
 * documents were supplied, and the submit/review transitions.
 */
@Injectable()
export class TutorVerificationRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Every required step, with this tutor's progress against it.
   *
   * LEFT JOIN from verification_steps so a step the tutor has not started
   * still appears, with a null status. Listing only rows in
   * tutor_verification_progress would hide exactly the steps they still owe.
   */
  async steps(userId: string, tutorId: string): Promise<VerificationStepRow[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<VerificationStepRow[]>`
        select vs.id, vs.name, vs.code, vs.description, vs.is_required, vs.sort_order,
               tvp.status::text as status, tvp.reviewer_notes, tvp.reviewed_at
        from public.verification_steps vs
        left join public.tutor_verification_progress tvp
          on tvp.step_id = vs.id and tvp.tutor_id = ${tutorId}::uuid
        where vs.is_active and vs.applies_to = 'tutor'
        order by vs.sort_order, vs.name
      `,
    );
  }

  async documents(userId: string, tutorId: string): Promise<TutorDocumentRow[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<TutorDocumentRow[]>`
        select id, tutor_id, step_id, label, storage_path, mime_type, size_bytes,
               status::text, reviewer_notes, reviewed_at, created_at
        from public.tutor_documents
        where tutor_id = ${tutorId}::uuid
        order by created_at desc
      `,
    );
  }

  /**
   * Records an uploaded document.
   *
   * The bytes are not handled here — the file goes to StorageProvider and only
   * its key reaches the database. That separation is what lets the storage
   * provider change without touching this table.
   */
  async addDocument(
    userId: string,
    input: {
      tutorId: string;
      stepId?: string | undefined;
      label: string;
      storagePath: string;
      mimeType?: string | undefined;
      sizeBytes?: number | undefined;
    },
  ): Promise<TutorDocumentRow> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<TutorDocumentRow[]>`
        insert into public.tutor_documents
          (tutor_id, step_id, label, storage_path, mime_type, size_bytes)
        values (
          ${input.tutorId}::uuid, ${input.stepId ?? null}::uuid, ${input.label},
          ${input.storagePath}, ${input.mimeType ?? null}, ${input.sizeBytes ?? null}
        )
        returning id, tutor_id, step_id, label, storage_path, mime_type, size_bytes,
                  status::text, reviewer_notes, reviewed_at, created_at
      `;
      return rows[0]!;
    });
  }

  async removeDocument(userId: string, documentId: string): Promise<string | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ storage_path: string }[]>`
        delete from public.tutor_documents
        where id = ${documentId}::uuid and public.owns_tutor(tutor_id)
        returning storage_path
      `;
      return rows[0]?.storage_path ?? null;
    });
  }

  /**
   * Submits for review, via tutor_submit_verification().
   *
   * That function decides whether the submission is complete and what status
   * results — it raises if a required step is missing. Returning its verdict
   * rather than computing one here keeps a single definition of "ready".
   */
  async submit(userId: string): Promise<string> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ status: string }[]>`
        select public.tutor_submit_verification()::text as status
      `;
      return rows[0]!.status;
    });
  }
}
