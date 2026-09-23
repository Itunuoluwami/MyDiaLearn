import { SetMetadata } from '@nestjs/common';

/** Mirrors the app_role enum in the existing database, in its declared order. */
export const APP_ROLES = [
  'student',
  'parent',
  'tutor',
  'agency',
  'admin',
  'super_admin',
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/** Requires the caller to hold at least one of these roles. */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Requires a specific permission key.
 *
 * The existing schema resolves these through role_permissions plus per-user
 * overrides in user_permissions, with super_admin implicitly holding all of
 * them — see the my_permissions() function. PermissionsGuard reads the
 * resolved set off the authenticated user rather than re-deriving it.
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
