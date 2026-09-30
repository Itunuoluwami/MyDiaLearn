import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { ConfigService } from '@nestjs/config';

import { LocalDiskStorageProvider } from './local-disk-storage.provider';

describe('LocalDiskStorageProvider', () => {
  let root: string;
  let provider: LocalDiskStorageProvider;

  const tokenOf = (url: string) => url.split('/files/signed/')[1]!;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'dialearn-storage-'));
    const values: Record<string, unknown> = {
      integrations: { storageLocalPath: root, storageSigningSecret: '' },
      app: { apiPrefix: 'api' },
      jwt: { secret: 'x'.repeat(48) },
    };
    provider = new LocalDiskStorageProvider({
      getOrThrow: (key: string) => values[key],
    } as unknown as ConfigService);
  });

  afterEach(() => rm(root, { recursive: true, force: true }));

  const put = (path: string) =>
    provider.upload({
      bucket: 'tutor-documents',
      path,
      content: Buffer.from('hello'),
      contentType: 'application/pdf',
    });

  it('stores under the bucket folder and serves it back through a signed link', async () => {
    await put('t1/a.pdf');
    expect(await readFile(join(root, 'tutor-documents', 't1', 'a.pdf'), 'utf8')).toBe('hello');

    const url = await provider.createSignedUrl({
      bucket: 'tutor-documents',
      path: 't1/a.pdf',
      expiresInSeconds: 60,
      contentType: 'application/pdf',
      downloadName: 'ID.pdf',
    });
    expect(url.startsWith('/api/files/signed/')).toBe(true);

    const download = await provider.resolveSignedToken(tokenOf(url));
    expect(download).toMatchObject({
      contentType: 'application/pdf',
      inline: true,
      downloadName: 'ID.pdf',
    });
  });

  it.each([
    '../x.pdf',
    't1/../../x.pdf',
    '/etc/passwd',
    't1//a.pdf',
    '.env',
    't1/.hidden',
    'a\\b.pdf',
  ])('refuses the key %p', async (key) => {
    await expect(put(key)).rejects.toThrow(/Invalid storage key/);
  });

  it('refuses an unknown bucket', async () => {
    await expect(
      provider.upload({
        bucket: 'secrets',
        path: 'a.pdf',
        content: Buffer.from(''),
        contentType: '',
      }),
    ).rejects.toThrow(/bucket/);
  });

  it('does not overwrite an existing object', async () => {
    await put('t1/a.pdf');
    await expect(put('t1/a.pdf')).rejects.toThrow();
  });

  it('rejects a tampered, expired or malformed token', async () => {
    await put('t1/a.pdf');
    const token = tokenOf(
      await provider.createSignedUrl({
        bucket: 'tutor-documents',
        path: 't1/a.pdf',
        expiresInSeconds: 60,
      }),
    );
    const [body, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ b: 'tutor-documents', p: 't2/b.pdf', e: 9e9 }),
    ).toString('base64url');
    expect(await provider.resolveSignedToken(`${forged}.${signature}`)).toBeNull();
    expect(await provider.resolveSignedToken(`${body}.${signature}x`)).toBeNull();
    expect(await provider.resolveSignedToken('garbage')).toBeNull();

    const expired = tokenOf(
      await provider.createSignedUrl({
        bucket: 'tutor-documents',
        path: 't1/a.pdf',
        expiresInSeconds: -1,
      }),
    );
    expect(await provider.resolveSignedToken(expired)).toBeNull();
  });

  it('serves script-capable types as downloads, never inline', async () => {
    await put('t1/page.html');
    const url = await provider.createSignedUrl({
      bucket: 'tutor-documents',
      path: 't1/page.html',
      expiresInSeconds: 60,
      contentType: 'text/html',
    });
    expect(await provider.resolveSignedToken(tokenOf(url))).toMatchObject({
      contentType: 'application/octet-stream',
      inline: false,
    });
  });

  it('treats removing a missing file as done', async () => {
    await expect(provider.remove('tutor-documents', ['t1/none.pdf'])).resolves.toBeUndefined();
  });
});
