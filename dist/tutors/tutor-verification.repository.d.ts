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
export declare class TutorVerificationRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    steps(userId: string, tutorId: string): Promise<VerificationStepRow[]>;
    documents(userId: string, tutorId: string): Promise<TutorDocumentRow[]>;
    addDocument(userId: string, input: {
        tutorId: string;
        stepId?: string | undefined;
        label: string;
        storagePath: string;
        mimeType?: string | undefined;
        sizeBytes?: number | undefined;
    }): Promise<TutorDocumentRow>;
    removeDocument(userId: string, documentId: string): Promise<string | null>;
    submit(userId: string): Promise<string>;
}
