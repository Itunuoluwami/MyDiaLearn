/**
 * File storage port.
 *
 * Today this is Supabase Storage across three buckets — avatars,
 * tutor-documents and learning-resources — with authorization enforced by
 * storage RLS policies. Some of those policies join application tables: the
 * "Families read shared learning files" policy matches storage.objects.name
 * against learning_resources.storage_path.
 *
 * No S3-compatible provider can express that. So the port deliberately centres
 * on short-lived signed URLs: authorization is decided by a NestJS service
 * before a URL is minted, which is the only shape that survives a provider
 * change. Mirrors the 120-second TTL the frontend already uses.
 */
export interface StoredObject {
  /** Provider-relative key, as stored in *.storage_path columns. */
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
  /** Served as this type; anything unsafe to render is downloaded instead. */
  contentType?: string | null;
  /** Suggested file name for the download. */
  downloadName?: string | null;
}

/** What a signed link resolves to, for providers that serve files themselves. */
export interface SignedDownload {
  absolutePath: string;
  contentType: string;
  downloadName: string;
  inline: boolean;
}

export interface StorageProvider {
  readonly name: string;
  upload(request: UploadRequest): Promise<StoredObject>;
  /**
   * Time-limited download URL. The caller is responsible for having checked
   * that this user may read this object — the provider does not know.
   */
  createSignedUrl(request: SignedUrlRequest): Promise<string>;
  remove(bucket: string, paths: string[]): Promise<void>;
  /**
   * Resolves a token minted by createSignedUrl. Only providers that serve
   * bytes through the API (local disk) implement it; a cloud provider's URL
   * points at the provider instead.
   */
  resolveSignedToken?(token: string): Promise<SignedDownload | null>;
}

/** The buckets DiaLearn stores into. Anything else is refused. */
export const STORAGE_BUCKETS = ['avatars', 'tutor-documents', 'learning-resources'] as const;

export const STORAGE_PROVIDER = Symbol('StorageProvider');
