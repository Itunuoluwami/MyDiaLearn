import { type SignedDownload, type StorageProvider } from '../integrations/storage/storage.interface';
import { FilesRepository } from './files.repository';
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
export declare class FilesService {
    private readonly repository;
    private readonly storage;
    constructor(repository: FilesRepository, storage: StorageProvider);
    upload(userId: string, kind: UploadKind, file: IncomingFile | undefined): Promise<UploadedFileResponse>;
    tutorDocumentUrl(userId: string, id: string): Promise<{
        url: string;
    }>;
    learningResourceUrl(userId: string, id: string): Promise<{
        url: string;
    }>;
    submissionUrl(userId: string, assignmentId: string): Promise<{
        url: string;
    }>;
    resolve(token: string): Promise<SignedDownload>;
    private sign;
}
export {};
