import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppConfig, IntegrationsConfig, JwtConfig } from '../../config/configuration';
import {
  STORAGE_BUCKETS,
  type SignedDownload,
  type SignedUrlRequest,
  type StorageProvider,
  type StoredObject,
  type UploadRequest,
} from './storage.interface';

/**
 * Types a browser may render in place. Everything else — HTML and SVG above
 * all, which would run script on the API's origin — is sent as a download.
 */
const INLINE_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
]);

/** One path segment: no separators, no dot-only names, nothing exotic. */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;

interface TokenPayload {
  b: string;
  p: string;
  e: number;
  t?: string | null;
  n?: string | null;
}

/**
 * Stores files on the API server's own disk.
 *
 * Chosen for the SmarterASP deployment, where the site's App_Data folder is
 * writable and never served by IIS. Files leave only through
 * /api/files/signed/:token — a link this class signs with an HMAC and an
 * expiry, after the files service has decided the caller may read the object.
 *
 * Keys keep the Supabase layout (`<tutorId>/<uuid>.pdf`,
 * `submissions/<userId>/…`) so the *.storage_path columns mean the same thing
 * under either backend.
 */
@Injectable()
export class LocalDiskStorageProvider implements StorageProvider {
  readonly name = 'local';

  private readonly logger = new Logger(LocalDiskStorageProvider.name);
  private readonly root: string;
  private readonly signingKey: Buffer;
  private readonly downloadBase: string;

  constructor(config: ConfigService) {
    const integrations = config.getOrThrow<IntegrationsConfig>('integrations');
    const app = config.getOrThrow<AppConfig>('app');
    this.root = resolve(integrations.storageLocalPath);
    // A dedicated secret when given; otherwise one derived from the JWT
    // secret, so a signed link can never double as an access token.
    this.signingKey = integrations.storageSigningSecret
      ? Buffer.from(integrations.storageSigningSecret)
      : createHmac('sha256', config.getOrThrow<JwtConfig>('jwt').secret)
          .update('dialearn.storage.signed-url.v1')
          .digest();
    this.downloadBase = `/${app.apiPrefix}/files/signed/`;
  }

  async upload(request: UploadRequest): Promise<StoredObject> {
    const target = this.locate(request.bucket, request.path);
    await mkdir(dirname(target), { recursive: true });
    // 'wx' refuses to overwrite: keys are random, so a collision is a bug.
    await writeFile(target, request.content, { flag: request.upsert ? 'w' : 'wx' });
    return {
      bucket: request.bucket,
      path: request.path,
      sizeBytes: request.content.length,
      contentType: request.contentType,
    };
  }

  async createSignedUrl(request: SignedUrlRequest): Promise<string> {
    this.locate(request.bucket, request.path);
    const payload: TokenPayload = {
      b: request.bucket,
      p: request.path,
      e: Math.floor(Date.now() / 1000) + request.expiresInSeconds,
      t: request.contentType ?? null,
      n: request.downloadName ?? null,
    };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${this.downloadBase}${body}.${this.sign(body)}`;
  }

  async resolveSignedToken(token: string): Promise<SignedDownload | null> {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;

    const expected = Buffer.from(this.sign(body));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

    let payload: TokenPayload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    } catch {
      return null;
    }
    if (typeof payload.e !== 'number' || payload.e < Date.now() / 1000) return null;

    let absolutePath: string;
    try {
      absolutePath = this.locate(payload.b, payload.p);
      if (!(await stat(absolutePath)).isFile()) return null;
    } catch {
      return null;
    }

    const contentType = (payload.t ?? '').toLowerCase().split(';')[0]!.trim();
    const inline = INLINE_TYPES.has(contentType);
    return {
      absolutePath,
      contentType: inline ? contentType : 'application/octet-stream',
      downloadName: payload.n || payload.p.split('/').pop()!,
      inline,
    };
  }

  async remove(bucket: string, paths: string[]): Promise<void> {
    for (const path of paths) {
      try {
        await unlink(this.locate(bucket, path));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          this.logger.warn(`Could not remove a stored file from ${bucket}`);
        }
      }
    }
  }

  /**
   * Maps bucket + key to a file under the storage root, refusing anything
   * that could step outside it. Keys come from the database, which a caller
   * can influence, so this is the last line against path traversal.
   */
  private locate(bucket: string, path: string): string {
    if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
      throw new Error('Unknown storage bucket.');
    }
    const segments = path.split('/');
    if (!segments.length || !segments.every((segment) => SEGMENT.test(segment))) {
      throw new Error('Invalid storage key.');
    }
    const absolute = resolve(this.root, bucket, ...segments);
    if (!absolute.startsWith(resolve(this.root, bucket) + sep)) {
      throw new Error('Invalid storage key.');
    }
    return absolute;
  }

  private sign(body: string): string {
    return createHmac('sha256', this.signingKey).update(body).digest('base64url');
  }
}
