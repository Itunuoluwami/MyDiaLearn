"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.Roles = exports.PERMISSIONS_KEY = exports.ROLES_KEY = exports.APP_ROLES = void 0;
const common_1 = require("@nestjs/common");
exports.APP_ROLES = [
    'student',
    'parent',
    'tutor',
    'agency',
    'admin',
    'super_admin',
];
exports.ROLES_KEY = 'roles';
exports.PERMISSIONS_KEY = 'permissions';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const RequirePermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=roles.decorator.js.map