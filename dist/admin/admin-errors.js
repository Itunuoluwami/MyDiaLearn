"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateAdminError = translateAdminError;
const app_exception_1 = require("../common/exceptions/app.exception");
const database_errors_1 = require("../common/exceptions/database-errors");
const ADMIN_REFUSALS = {
    SELF_APPROVAL_FORBIDDEN: 409,
    SELF_ROLE_GRANT_FORBIDDEN: 409,
    SELF_SUSPEND_FORBIDDEN: 409,
    ELEVATED_ROLE_REQUIRES_SUPER_ADMIN: 403,
    ELEVATED_ROLE_REQUIRES_APPROVAL: 409,
    LAST_SUPER_ADMIN_PROTECTED: 409,
    REQUEST_ALREADY_REVIEWED: 409,
    REQUEST_NOT_FOUND: 404,
    INVITATION_EXPIRED: 410,
    INVITATION_NOT_FOUND: 404,
    INVALID_OTP: 400,
    EMAIL_MISMATCH: 403,
    EMAIL_DOMAIN_NOT_ALLOWED: 400,
    INVITE_DOMAIN_ALLOWLIST_EMPTY: 409,
    PAYMENT_NOT_REFUNDABLE: 409,
    PAYOUT_NOT_SETTLEABLE: 409,
    PAYOUT_NOT_REJECTABLE: 409,
    UNKNOWN_ACTION: 400,
    ALREADY_EXISTS: 409,
    IN_USE: 409,
    NOT_AUTHORIZED: 403,
};
const CODE_FOR_STATUS = {
    400: app_exception_1.ErrorCode.VALIDATION_FAILED,
    403: app_exception_1.ErrorCode.NOT_AUTHORIZED,
    404: app_exception_1.ErrorCode.NOT_FOUND,
    409: app_exception_1.ErrorCode.CONFLICT,
    410: app_exception_1.ErrorCode.CONFLICT,
};
function translateAdminError(error, fallback) {
    const message = error instanceof Error ? error.message : String(error);
    for (const [reason, status] of Object.entries(ADMIN_REFUSALS)) {
        if (message.includes(reason)) {
            return new app_exception_1.AppException(CODE_FOR_STATUS[status] ?? app_exception_1.ErrorCode.CONFLICT, reason, status, {
                reason,
            });
        }
    }
    return (0, database_errors_1.translateDatabaseError)(error, fallback);
}
//# sourceMappingURL=admin-errors.js.map