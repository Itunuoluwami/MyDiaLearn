import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { RESOURCE_VISIBLE } from '../teaching/teaching.repository';

export interface StoredFileRow {
  storage_path: string;
  mime_type: string | null;
  name: string | null;
}

/**
 * Who may read which stored object.
 *
 * Each query is the storage.objects SELECT policy for that bucket, re-expressed
 * against the row that owns the key. The API's connection owns these tables,
 * so row-level security does not apply; these predicates are the check.
 */
@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** The caller's tutor id, creating the tutor row as the rest of the API does. */
  async ownTutorId(userId: string): Promise<string | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string | null }[]>`
        select public.current_tutor_id() as id
      `;
      return rows[0]?.id ?? null;
    });
  }

  /** tutor_docs_owner_read: the tutor it belongs to, or an admin. */
  async tutorDocument(userId: string, documentId: string): Promise<StoredFileRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<StoredFileRow[]>`
        select storage_path, mime_type, label as name
        from public.tutor_documents
        where id = ${documentId}::uuid
          and storage_path is not null and storage_path <> ''
          and (public.owns_tutor(tutor_id) or public.is_admin())
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * "Tutors manage own learning files" and "Families read shared learning
   * files" — the same predicate as reading the resource row itself.
   */
  async learningResource(userId: string, resourceId: string): Promise<StoredFileRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<StoredFileRow[]>`
        select storage_path, mime_type, title as name
        from public.learning_resources
        where id = ${resourceId}::uuid and storage_path is not null and ${RESOURCE_VISIBLE}
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * "Tutors read submissions for their assignments" and "Families read own
   * submissions" (the submissions/<uid>/ folder).
   */
  async submission(userId: string, assignmentId: string): Promise<StoredFileRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<StoredFileRow[]>`
        select submission_path as storage_path, null::text as mime_type, title as name
        from public.assignments
        where id = ${assignmentId}::uuid
          and submission_path is not null
          and (public.owns_tutor(tutor_id)
               or starts_with(submission_path, 'submissions/' || auth.uid()::text || '/'))
      `;
      return rows[0] ?? null;
    });
  }
}
