import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY, ROLES_KEY } from '../common/decorators/roles.decorator';
import { AdminController } from './admin.controller';
import {
  GovernanceController,
  InvitationsController,
} from './governance/governance.controller';
import { AdminSettingsController } from './settings/admin-settings.controller';

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
    ['reviews', 'admin.moderation'],
    ['setReviewPublished', 'admin.moderation'],
    ['messages', 'admin.moderation'],
    ['setMessageHidden', 'admin.moderation'],
    ['agencies', 'admin.verification'],
    ['agency', 'admin.verification'],
    ['reviewAgencyStep', 'admin.verification'],
    ['decideAgency', 'admin.verification'],
    ['setAgencyShare', 'admin.settings'],
  ])('%s requires %s', (method, permission) => {
    expect(permissionOf(method)).toEqual([permission]);
  });

  it.each(['dashboard', 'report'])(
    'leaves %s open to any admin, as the portal does',
    (method) => {
      expect(permissionOf(method)).toBeUndefined();
    },
  );

  it('has no route that cancels a booking without the approval queue', () => {
    // admin_cancel_booking() refunds money; only admin_execute_action() may run it.
    const source = readFileSync(join(__dirname, 'admin.repository.ts'), 'utf8');
    expect(source).not.toMatch(/admin_cancel_booking|admin_execute_action/);
  });
});

describe('Admin settings and governance access', () => {
  const reflector = new Reflector();

  it('gates every settings route on admin.settings at the controller', () => {
    expect(reflector.get<string[]>(ROLES_KEY, AdminSettingsController)).toEqual(['admin']);
    expect(reflector.get<string[]>(PERMISSIONS_KEY, AdminSettingsController)).toEqual([
      'admin.settings',
    ]);
  });

  const proto = GovernanceController.prototype as unknown as Record<string, () => unknown>;
  const of = (key: string, method: string) =>
    reflector.get<string[] | undefined>(key, proto[method]!);

  it('requires the admin role on governance', () => {
    expect(reflector.get<string[]>(ROLES_KEY, GovernanceController)).toEqual(['admin']);
  });

  it.each([
    ['accounts', 'admin.admins'],
    ['invitations', 'admin.admins'],
    ['revoke', 'admin.admins'],
    ['permissionCatalog', 'admin.admins'],
    ['userPermissions', 'admin.admins'],
    ['requestElevatedRole', 'admin.admins'],
    ['requests', 'admin.approvals'],
    ['createRequest', 'admin.approvals'],
    ['review', 'admin.approvals'],
    ['auditLogs', 'admin.audit'],
  ])('%s requires %s', (method, permission) => {
    expect(of(PERMISSIONS_KEY, method)).toEqual([permission]);
  });

  it.each(['invite', 'setUserPermission'])('%s is super admin only', (method) => {
    expect(of(ROLES_KEY, method)).toEqual(['super_admin']);
  });

  it('lets a signed-in non-admin redeem an invitation', () => {
    expect(
      reflector.get<string[] | undefined>(ROLES_KEY, InvitationsController),
    ).toBeUndefined();
  });
});
