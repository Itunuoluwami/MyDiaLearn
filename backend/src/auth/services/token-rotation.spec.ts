import { PasswordService } from './password.service';
import { TokenService } from './token.service';

import type { RefreshTokenRow } from '../../database/repositories/refresh-token.repository';

/**
 * Refresh-token rotation has to tell two things apart that look identical in
 * the database: a stolen token being replayed, and a legitimate client racing
 * itself because a second tab or a page navigation started a refresh before
 * the first one's `Set-Cookie` landed.
 *
 * Getting that wrong in the strict direction is not a theoretical problem —
 * it logged real users out mid-session, because the losing request killed the
 * whole family including the token the winner had just been handed.
 */
describe('TokenService refresh-token rotation', () => {
  const passwords = new PasswordService();

  function harness(row: Partial<RefreshTokenRow> & { revoked_at: Date | null }) {
    const revokeFamily = jest.fn().mockResolvedValue(undefined);
    const revoke = jest.fn().mockResolvedValue(undefined);
    const full: RefreshTokenRow = {
      id: 'token-1',
      user_id: 'user-1',
      family_id: 'family-1',
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      revoked_reason: null,
      ...row,
    };
    const repo = {
      findByHash: jest.fn().mockResolvedValue(full),
      revokeFamily,
      revoke,
    };
    const service = new TokenService(
      {} as never,
      passwords,
      repo as never,
      {} as never,
    );
    return { service, revokeFamily, revoke };
  }

  it('spends a live token and reports ok', async () => {
    const { service, revokeFamily, revoke } = harness({ revoked_at: null });
    const outcome = await service.redeemRefreshToken('presented');

    expect(outcome).toMatchObject({ kind: 'ok', userId: 'user-1', familyId: 'family-1' });
    expect(revoke).toHaveBeenCalledWith('token-1', 'rotated');
    expect(revokeFamily).not.toHaveBeenCalled();
  });

  it('forgives a token this chain rotated moments ago, and keeps the family', async () => {
    // The race: two refreshes in flight, the second carrying the cookie the
    // first just replaced. Killing the family here is what signed users out.
    const { service, revokeFamily } = harness({
      revoked_at: new Date(Date.now() - 500),
      revoked_reason: 'rotated',
    });
    const outcome = await service.redeemRefreshToken('presented');

    expect(outcome).toMatchObject({ kind: 'concurrent', familyId: 'family-1' });
    expect(revokeFamily).not.toHaveBeenCalled();
  });

  it('kills the family for the same token replayed after the grace window', async () => {
    const { service, revokeFamily } = harness({
      revoked_at: new Date(Date.now() - 60_000),
      revoked_reason: 'rotated',
    });
    const outcome = await service.redeemRefreshToken('presented');

    expect(outcome).toMatchObject({ kind: 'reuse', familyId: 'family-1' });
    expect(revokeFamily).toHaveBeenCalledWith('family-1', 'reuse_detected');
  });

  it('kills the family for a token revoked for any other reason, however recent', async () => {
    // Only rotation races are forgiven. A token revoked by logout or by an
    // earlier reuse detection is never a benign retry.
    for (const reason of ['logout', 'reuse_detected', 'expired', null]) {
      const { service, revokeFamily } = harness({
        revoked_at: new Date(Date.now() - 100),
        revoked_reason: reason,
      });
      const outcome = await service.redeemRefreshToken('presented');

      expect(outcome).toMatchObject({ kind: 'reuse' });
      expect(revokeFamily).toHaveBeenCalledWith('family-1', 'reuse_detected');
    }
  });

  it('reports an expired token as invalid without killing the family', async () => {
    const { service, revokeFamily, revoke } = harness({
      revoked_at: null,
      expires_at: new Date(Date.now() - 1000),
    });
    const outcome = await service.redeemRefreshToken('presented');

    expect(outcome).toEqual({ kind: 'invalid' });
    expect(revoke).toHaveBeenCalledWith('token-1', 'expired');
    expect(revokeFamily).not.toHaveBeenCalled();
  });

  it('reports an unknown token as invalid', async () => {
    const repo = { findByHash: jest.fn().mockResolvedValue(null), revokeFamily: jest.fn(), revoke: jest.fn() };
    const service = new TokenService({} as never, passwords, repo as never, {} as never);

    expect(await service.redeemRefreshToken('nonsense')).toEqual({ kind: 'invalid' });
  });
});
