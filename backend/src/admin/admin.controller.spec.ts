import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
    ['bookings', 'admin.bookings'],
    ['overrideBookingStatus', 'admin.bookings'],
    ['requestCancellation', 'admin.bookings'],
    ['payments', 'admin.payments'],
    ['requestRefund', 'admin.payments'],
    ['payouts', 'admin.payouts'],
    ['requestSettlement', 'admin.payouts'],
    ['rejectPayout', 'admin.payouts'],
    ['disputes', 'admin.disputes'],
    ['resolveDispute', 'admin.disputes'],
  ])('%s requires %s', (method, permission) => {
    expect(permissionOf(method)).toEqual([permission]);
  });

  it('leaves the dashboard open to any admin, as the portal does', () => {
    expect(permissionOf('dashboard')).toBeUndefined();
  });

  it('has no route that cancels a booking without the approval queue', () => {
    // admin_cancel_booking() refunds money; only admin_execute_action() may run it.
    const source = readFileSync(join(__dirname, 'admin.repository.ts'), 'utf8');
    expect(source).not.toMatch(/admin_cancel_booking|admin_execute_action/);
  });
});
