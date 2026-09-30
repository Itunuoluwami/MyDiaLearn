import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { AppException, ErrorCode, NotFoundError } from '../common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  type SignedDownload,
  type StorageProvider,
} from '../integrations/storage/storage.interface';
import { FilesRepository, type StoredFileRow } from './files.repository';

/** Matches the 120-second links the frontend used with Supabase. */
const LINK_TTL_SECONDS = 120;

/** The shape multer hands over; @types/multer is not a dependency. */
export interface IncomingFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadedFileResponse {
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number;
}

type UploadKind = 'tutor-document' | 'learning-resource' | 'submission';

const BUCKET: Record<UploadKind, string> = {
  'tutor-document': 'tutor-documents',
  'learning-resource': 'learning-resources',
  submission: 'learning-resources',
};

/**
 * Uploads and signed download links.
 *
 * Upload keys are generated here, never taken from the caller, in the layout
 * the Supabase storage policies required: `<tutorId>/<uuid>.<ext>` for a
 * tutor's files, `submissions/<userId>/<uuid>.<ext>` for a family's work. The
 * record that points at the key is then created through the existing
 * endpoints (POST /tutors/me/documents, /learning-resources,
 * /assignments/:id/submit), which re-check the key belongs to the caller.
 */
@Injectable()
export class FilesService {
  constructor(
    private readonly repository: FilesRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async upload(
    userId: string,
    kind: UploadKind,
    file: IncomingFile | undefined,
  ): Promise<UploadedFileResponse> {
    if (!file || !file.size) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        'Choose a file to upload.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let folder: string;
    if (kind === 'submission') {
      folder = `submissions/${userId}`;
    } else {
      const tutorId = await this.repository.ownTutorId(userId);
      if (!tutorId) throw new NotFoundError('Tutor profile');
      folder = tutorId;
    }

    const storagePath = `${folder}/${randomUUID()}.${extensionOf(file.originalname)}`;
    const mimeType = file.mimetype || null;
    await this.storage.upload({
      bucket: BUCKET[kind],
      path: storagePath,
      content: file.buffer,
      contentType: mimeType ?? 'application/octet-stream',
    });
    return { storagePath, mimeType, sizeBytes: file.size };
  }

  tutorDocumentUrl(userId: string, id: string): Promise<{ url: string }> {
    return this.sign('tutor-documents', this.repository.tutorDocument(userId, id));
  }

  learningResourceUrl(userId: string, id: string): Promise<{ url: string }> {
    return this.sign('learning-resources', this.repository.learningResource(userId, id));
  }

  submissionUrl(userId: string, assignmentId: string): Promise<{ url: string }> {
    return this.sign('learning-resources', this.repository.submission(userId, assignmentId));
  }

  async resolve(token: string): Promise<SignedDownload> {
    const download = await this.storage.resolveSignedToken?.(token);
    // One answer for expired, forged and missing: which one it was is of use
    // only to someone probing.
    if (!download) throw new NotFoundError('File');
    return download;
  }

  private async sign(
    bucket: string,
    lookup: Promise<StoredFileRow | null>,
  ): Promise<{ url: string }> {
    // Not found and not permitted look the same, so ids cannot be probed.
    const row = await lookup;
    if (!row) throw new NotFoundError('File');
    const url = await this.storage.createSignedUrl({
      bucket,
      path: row.storage_path,
      expiresInSeconds: LINK_TTL_SECONDS,
      contentType: row.mime_type,
      downloadName: downloadName(row),
    });
    return { url };
  }
}

function extensionOf(name: string): string {
  const extension = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  return /^[a-z0-9]{1,10}$/.test(extension) ? extension : 'bin';
}

function downloadName(row: StoredFileRow): string {
  const extension = row.storage_path.split('.').pop() ?? 'bin';
  const base =
    (row.name ?? 'file')
      .replace(/[^A-Za-z0-9 ._-]+/g, '')
      .trim()
      .slice(0, 80) || 'file';
  return base.toLowerCase().endsWith(`.${extension}`) ? base : `${base}.${extension}`;
}
