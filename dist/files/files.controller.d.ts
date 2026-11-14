import type { Response } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { FilesService, type IncomingFile, type UploadedFileResponse } from './files.service';
export declare class FilesController {
    private readonly files;
    constructor(files: FilesService);
    uploadTutorDocument(user: AuthenticatedUser, file: IncomingFile | undefined): Promise<UploadedFileResponse>;
    uploadLearningResource(user: AuthenticatedUser, file: IncomingFile | undefined): Promise<UploadedFileResponse>;
    uploadSubmission(user: AuthenticatedUser, file: IncomingFile | undefined): Promise<UploadedFileResponse>;
    tutorDocumentUrl(user: AuthenticatedUser, id: string): Promise<{
        url: string;
    }>;
    learningResourceUrl(user: AuthenticatedUser, id: string): Promise<{
        url: string;
    }>;
    submissionUrl(user: AuthenticatedUser, assignmentId: string): Promise<{
        url: string;
    }>;
    download(token: string, response: Response): Promise<void>;
}
