import { AppException, ErrorCode } from '../common/exceptions/app.exception';
import { translateDatabaseError } from '../common/exceptions/database-errors';

/**
 * Refusal codes raised by the admin and governance PL/pgSQL functions.
 *
 * They are returned as the error message, unchanged: the admin portal's
 * friendlyAdminError() already turns each one into a sentence, and it was
 * written against these exact strings when the portal called the functions
 * directly. Re-wording them here would mean two lists to keep in step.
 */
const ADMIN_REFUSALS: Record<string, number> = {
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
  // Raised by the settings service for unique / foreign-key violations.
  ALREADY_EXISTS: 409,
  IN_USE: 409,
  NOT_AUTHORIZED: 403,
};

const CODE_FOR_STATUS: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_FAILED,
  403: ErrorCode.NOT_AUTHORIZED,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.CONFLICT,
  410: ErrorCode.CONFLICT,
};

export function translateAdminError(error: unknown, fallback: string): AppException {
  const message = error instanceof Error ? error.message : String(error);
  for (const [reason, status] of Object.entries(ADMIN_REFUSALS)) {
    if (message.includes(reason)) {
      return new AppException(CODE_FOR_STATUS[status] ?? ErrorCode.CONFLICT, reason, status, {
        reason,
      });
    }
  }
  return translateDatabaseError(error, fallback);
}
