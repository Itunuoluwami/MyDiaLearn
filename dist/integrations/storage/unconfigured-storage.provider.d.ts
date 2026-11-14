import type { SignedUrlRequest, StorageProvider, StoredObject, UploadRequest } from './storage.interface';
export declare class UnconfiguredStorageProvider implements StorageProvider {
    readonly name = "unconfigured";
    upload(_request: UploadRequest): Promise<StoredObject>;
    createSignedUrl(_request: SignedUrlRequest): Promise<string>;
    remove(_bucket: string, _paths: string[]): Promise<void>;
}
