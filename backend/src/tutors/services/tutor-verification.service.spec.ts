import { Test } from '@nestjs/testing';

import { AuditService } from '../../common/audit/audit.service';
import type { AppException } from '../../common/exceptions/app.exception';
import { STORAGE_PROVIDER } from '../../integrations/storage/storage.interface';
import { TutorVerificationRepository } from '../tutor-verification.repository';
import { TutorsRepository } from '../tutors.repository';
import {
  TutorVerificationService,
  translateVerificationError,
} from './tutor-verification.service';

const TUTOR_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

describe('TutorVerificationService', () => {
  let service: TutorVerificationService;
  let repository: Record<string, jest.Mock>;
  let storage: Record<string, jest.Mock>;
  let audit: Record<string, jest.Mock>;

  beforeEach(async () => {
    repository = {
      steps: jest.fn().mockResolvedValue([]),
      documents: jest.fn().mockResolvedValue([]),
      addDocument: jest.fn().mockResolvedValue({
        id: 'd1',
        tutor_id: TUTOR_ID,
        step_id: null,
        label: 'ID',
        storage_path: `${TUTOR_ID}/x.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 10,
        status: 'pending',
        reviewer_notes: null,
        reviewed_at: null,
        created_at: new Date(),
      }),
      removeDocument: jest.fn().mockResolvedValue(`${TUTOR_ID}/x.pdf`),
      submit: jest.fn().mockResolvedValue('pending'),
    };
    storage = { remove: jest.fn().mockResolvedValue(undefined) };
    audit = { record: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TutorVerificationService,
        { provide: TutorVerificationRepository, useValue: repository },
        {
          provide: TutorsRepository,
          useValue: { ensureOwn: jest.fn().mockResolvedValue({ id: TUTOR_ID }) },
        },
        { provide: AuditService, useValue: audit },
        { provide: STORAGE_PROVIDER, useValue: storage },
      ],
    }).compile();

    service = moduleRef.get(TutorVerificationService);
  });

  describe('document ownership', () => {
    it('accepts a key inside the tutor’s own namespace', async () => {
      const doc = await service.addDocument(
        'u1',
        { label: 'ID', storagePath: `${TUTOR_ID}/passport.pdf` },
        {},
      );
      expect(doc.id).toBe('d1');
    });

    it('refuses a key belonging to another tutor', async () => {
      // The table's RLS policy checks tutor_id, not the path inside it — so
      // without this a tutor could register a row pointing at someone else's
      // document and have a signed URL minted for it.
      const error = await service
        .addDocument(
          'u1',
          { label: 'ID', storagePath: 'bbbbbbbb-0000-4000-8000-000000000002/passport.pdf' },
          {},
        )
        .catch((e: AppException) => e);

      expect((error as AppException).getStatus()).toBe(403);
      expect(repository.addDocument).not.toHaveBeenCalled();
    });

    it('refuses a traversal attempt', async () => {
      await expect(
        service.addDocument(
          'u1',
          { label: 'ID', storagePath: `${TUTOR_ID}/../other/passport.pdf` },
          {},
        ),
      ).rejects.toThrow(/does not belong/);
    });

    it('refuses a bare filename with no namespace', async () => {
      await expect(
        service.addDocument('u1', { label: 'ID', storagePath: 'passport.pdf' }, {}),
      ).rejects.toThrow(/does not belong/);
    });
  });

  describe('response shape', () => {
    it('never returns the storage key', async () => {
      // It is an internal identifier; the only legitimate use is minting a
      // signed URL, which is a separate authorised call.
      const doc = await service.addDocument(
        'u1',
        { label: 'ID', storagePath: `${TUTOR_ID}/passport.pdf` },
        {},
      );
      expect(JSON.stringify(doc)).not.toContain('passport.pdf');
      expect(doc).not.toHaveProperty('storagePath');
    });
  });

  describe('removal', () => {
    it('succeeds even when storage is unconfigured', async () => {
      // Files still belong to Supabase, so StorageProvider throws today. The
      // row is already gone; an orphaned object is housekeeping, not something
      // the tutor can act on.
      storage.remove.mockRejectedValue(new Error('not configured'));
      await expect(service.removeDocument('u1', 'd1', {})).resolves.toBeUndefined();
      expect(audit.record).toHaveBeenCalledWith('tutor.document_removed', expect.anything());
    });

    it('reports a missing document rather than pretending', async () => {
      repository.removeDocument.mockResolvedValue(null);
      await expect(service.removeDocument('u1', 'nope', {})).rejects.toThrow(/not found/i);
    });
  });

  describe('submission', () => {
    it('returns the database’s verdict rather than computing one', async () => {
      const result = await service.submit('u1', {});
      expect(result).toEqual({ status: 'pending' });
      expect(audit.record).toHaveBeenCalledWith(
        'tutor.verification_submitted',
        expect.objectContaining({ entityId: TUTOR_ID }),
      );
    });
  });
});

describe('translateVerificationError', () => {
  it('maps an incomplete submission to a 400 the tutor can act on', () => {
    expect(translateVerificationError(new Error('MISSING_STEP')).getStatus()).toBe(400);
  });

  it('maps a repeat submission to a conflict', () => {
    expect(translateVerificationError(new Error('ALREADY_SUBMITTED')).getStatus()).toBe(409);
  });

  it('does not leak an unrecognised database error', () => {
    const error = translateVerificationError(
      new Error('relation "internal_x" does not exist'),
    );
    expect(error.getStatus()).toBe(500);
    expect(error.message).not.toContain('internal_x');
  });
});
