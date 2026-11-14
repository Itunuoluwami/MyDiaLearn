import { PrismaService } from '../database/prisma.service';
export interface StoredFileRow {
    storage_path: string;
    mime_type: string | null;
    name: string | null;
}
export declare class FilesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ownTutorId(userId: string): Promise<string | null>;
    tutorDocument(userId: string, documentId: string): Promise<StoredFileRow | null>;
    learningResource(userId: string, resourceId: string): Promise<StoredFileRow | null>;
    submission(userId: string, assignmentId: string): Promise<StoredFileRow | null>;
}
