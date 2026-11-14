import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { AppException } from '../../common/exceptions/app.exception';
import { type StorageProvider } from '../../integrations/storage/storage.interface';
import type { AddTutorDocumentDto, TutorDocumentResponse, VerificationStepResponse } from '../dto/tutor.dto';
import { TutorVerificationRepository, type TutorDocumentRow, type VerificationStepRow } from '../tutor-verification.repository';
import { TutorsRepository } from '../tutors.repository';
export declare class TutorVerificationService {
    private readonly repository;
    private readonly tutors;
    private readonly audit;
    private readonly storage;
    constructor(repository: TutorVerificationRepository, tutors: TutorsRepository, audit: AuditService, storage: StorageProvider);
    steps(userId: string): Promise<VerificationStepResponse[]>;
    documents(userId: string): Promise<TutorDocumentResponse[]>;
    addDocument(userId: string, dto: AddTutorDocumentDto, context: AuditContext): Promise<TutorDocumentResponse>;
    removeDocument(userId: string, documentId: string, context: AuditContext): Promise<void>;
    submit(userId: string, context: AuditContext): Promise<{
        status: string;
    }>;
}
export declare function translateVerificationError(error: unknown): AppException;
export declare function toStepResponse(row: VerificationStepRow): VerificationStepResponse;
export declare function toDocumentResponse(row: TutorDocumentRow): TutorDocumentResponse;
