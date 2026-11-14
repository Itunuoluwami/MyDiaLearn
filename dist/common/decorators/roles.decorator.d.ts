export declare const APP_ROLES: readonly ["student", "parent", "tutor", "agency", "admin", "super_admin"];
export type AppRole = (typeof APP_ROLES)[number];
export declare const ROLES_KEY = "roles";
export declare const PERMISSIONS_KEY = "permissions";
export declare const Roles: (...roles: AppRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermission: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
