export interface StoredObject {
    path: string;
    bucket: string;
    sizeBytes: number;
    contentType: string;
}
export interface UploadRequest {
    bucket: string;
    path: string;
    content: Buffer;
    contentType: string;
    upsert?: boolean;
}
export interface SignedUrlRequest {
    bucket: string;
    path: string;
    expiresInSeconds: number;
    contentType?: string | null;
    downloadName?: string | null;
}
export interface SignedDownload {
    absolutePath: string;
    contentType: string;
    downloadName: string;
    inline: boolean;
}
export interface StorageProvider {
    readonly name: string;
    upload(request: UploadRequest): Promise<StoredObject>;
    createSignedUrl(request: SignedUrlRequest): Promise<string>;
    remove(bucket: string, paths: string[]): Promise<void>;
    resolveSignedToken?(token: string): Promise<SignedDownload | null>;
}
export declare const STORAGE_BUCKETS: readonly ["avatars", "tutor-documents", "learning-resources"];
export declare const STORAGE_PROVIDER: unique symbol;
