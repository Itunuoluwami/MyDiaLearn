import { translateAdminError } from './admin-errors';

describe('translateAdminError', () => {
  const pgError = (code: string) =>
    new Error(`Raw query failed. Code: \`P0001\`. Message: \`${code}\``);

  it.each([
    ['ELEVATED_ROLE_REQUIRES_APPROVAL', 409],
    ['SELF_ROLE_GRANT_FORBIDDEN', 409],
    ['REQUEST_NOT_FOUND', 404],
    ['INVITATION_EXPIRED', 410],
    ['INVALID_OTP', 400],
    ['NOT_AUTHORIZED', 403],
  ])('returns %s as a %i carrying the code the portal maps', (code, status) => {
    const error = translateAdminError(pgError(code), 'fallback');
    expect(error.getStatus()).toBe(status);
    expect((error.getResponse() as { message: string }).message).toBe(code);
  });

  it('falls back to a 500 with the given message for anything unrecognised', () => {
    const error = translateAdminError(new Error('connection reset'), 'We could not do that.');
    expect(error.getStatus()).toBe(500);
    expect((error.getResponse() as { message: string }).message).toBe('We could not do that.');
  });
});
