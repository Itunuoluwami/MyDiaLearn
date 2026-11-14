import { ConfigService } from '@nestjs/config';
import { type SignedDownload, type SignedUrlRequest, type StorageProvider, type StoredObject, type UploadRequest } from './storage.interface';
export declare class LocalDiskStorageProvider implements StorageProvider {
    readonly name = "local";
    private readonly logger;
    private readonly root;
    private readonly signingKey;
    private readonly downloadBase;
    constructor(config: ConfigService);
    upload(request: UploadRequest): Promise<StoredObject>;
    createSignedUrl(request: SignedUrlRequest): Promise<string>;
    resolveSignedToken(token: string): Promise<SignedDownload | null>;
    remove(bucket: string, paths: string[]): Promise<void>;
    private locate;
    private sign;
}
