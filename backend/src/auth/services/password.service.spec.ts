import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  describe('password hashing', () => {
    it('produces an argon2id hash, not the password', async () => {
      const hash = await service.hash('correct horse battery staple');
      expect(hash).toMatch(/^\$argon2id\$/);
      expect(hash).not.toContain('correct horse');
    });

    it('salts, so the same password hashes differently every time', async () => {
      const [a, b] = await Promise.all([service.hash('same'), service.hash('same')]);
      expect(a).not.toEqual(b);
    });

    it('verifies a correct password and rejects a wrong one', async () => {
      const hash = await service.hash('Str0ng!Passw0rd');
      expect(await service.verify(hash, 'Str0ng!Passw0rd')).toBe(true);
      expect(await service.verify(hash, 'Str0ng!Passw0r')).toBe(false);
    });

    it('returns false rather than throwing on a null or malformed hash', async () => {
      // A truncated column or a row written by something else must not turn
      // the login path into a 500 — which would itself reveal that the
      // account exists.
      expect(await service.verify(null, 'anything')).toBe(false);
      expect(await service.verify('not-a-hash', 'anything')).toBe(false);
      expect(await service.verify('', 'anything')).toBe(false);
    });
  });

  describe('timing', () => {
    it('dummyVerify costs roughly what a real verification costs', async () => {
      // Guards the property that a missing account and a wrong password take
      // comparable time. Loose bounds: this asserts the same order of
      // magnitude, not a precise duration, so it does not flake on CI.
      const hash = await service.hash('reference');

      const realStart = performance.now();
      await service.verify(hash, 'wrong');
      const real = performance.now() - realStart;

      const dummyStart = performance.now();
      await service.dummyVerify();
      const dummy = performance.now() - dummyStart;

      expect(dummy).toBeGreaterThan(real * 0.2);
      expect(dummy).toBeLessThan(real * 5);
    });
  });

  describe('opaque tokens', () => {
    it('mints high-entropy URL-safe tokens', () => {
      const token = service.createToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      // 32 random bytes in base64url.
      expect(token.length).toBeGreaterThanOrEqual(43);
    });

    it('never repeats', () => {
      const tokens = new Set(Array.from({ length: 500 }, () => service.createToken()));
      expect(tokens.size).toBe(500);
    });

    it('hashes deterministically, so a presented token can be looked up', () => {
      const token = service.createToken();
      expect(service.hashToken(token)).toEqual(service.hashToken(token));
      expect(service.hashToken(token)).not.toEqual(token);
      expect(service.hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('safeEquals', () => {
    it('compares equal and unequal strings correctly', () => {
      expect(service.safeEquals('abc', 'abc')).toBe(true);
      expect(service.safeEquals('abc', 'abd')).toBe(false);
    });

    it('handles length mismatch without throwing', () => {
      // timingSafeEqual throws on differing lengths; the guard matters.
      expect(service.safeEquals('short', 'much longer string')).toBe(false);
    });
  });
});
