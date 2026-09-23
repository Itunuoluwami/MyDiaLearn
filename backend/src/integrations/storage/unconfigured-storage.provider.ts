import { Injectable } from '@nestjs/common';

import { NotImplementedError } from '../../common/exceptions/app.exception';
import type {
  SignedUrlRequest,
  StorageProvider,
  StoredObject,
  UploadRequest,
} from './storage.interface';

/**
 * The default, and correct for this phase.
 *
 * File storage still belongs to Supabase, and the frontend still talks to it
 * directly — migration rule 7 forbids removing that before a verified
 * replacement exists. Binding a no-op adapter that silently succeeded would be
 * worse than binding nothing: uploads would appear to work and files would
 * vanish. Every method fails loudly with 501 instead.
 */
@Injectable()
export class UnconfiguredStorageProvider implements StorageProvider {
  readonly name = 'unconfigured';

  async upload(_request: UploadRequest): Promise<StoredObject> {
    throw new NotImplementedError('File storage');
  }

  async createSignedUrl(_request: SignedUrlRequest): Promise<string> {
    throw new NotImplementedError('File storage');
  }

  async remove(_bucket: string, _paths: string[]): Promise<void> {
    throw new NotImplementedError('File storage');
  }
}
