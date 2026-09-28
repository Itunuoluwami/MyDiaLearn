import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY, ROLES_KEY } from '../common/decorators/roles.decorator';
import { AdminController } from './admin.controller';

/**
 * The admin API's access map. Guards read these decorators, so a route that
 * loses one would silently open up; this pins every route to its gate.
 */
describe('AdminController access', () => {
  const reflector = new Reflector();
  const proto = AdminController.prototype as unknown as Record<string, () => unknown>;
  const permissionOf = (method: string) =>
    reflector.get<string[] | undefined>(PERMISSIONS_KEY, proto[method]!);

  it('requires the admin role on the whole controller', () => {
    expect(reflector.get<string[]>(ROLES_KEY, AdminController)).toEqual(['admin']);
  });

  it.each([
    ['users', 'admin.users'],
    ['suspend', 'admin.users'],
    ['verificationQueue', 'admin.verification'],
    ['verificationDetail', 'admin.verification'],
    ['reviewStep', 'admin.verification'],
    ['reviewDocument', 'admin.verification'],
    ['approve', 'admin.verification'],
    ['reject', 'admin.verification'],
    ['setHourlyRate', 'admin.verification'],
  ])('%s requires %s', (method, permission) => {
    expect(permissionOf(method)).toEqual([permission]);
  });

  it('leaves the dashboard open to any admin, as the portal does', () => {
    expect(permissionOf('dashboard')).toBeUndefined();
  });
});
