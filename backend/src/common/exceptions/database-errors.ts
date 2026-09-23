import { AppException, ErrorCode } from './app.exception';

/**
 * Turns the database's raised exceptions into answers a caller can act on.
 *
 * The PL/pgSQL functions raise bare codes — NOT_AUTHORIZED, ALREADY_PAID — and
 * the booking exclusion constraints surface as SQLSTATE 23P01. Untranslated,
 * the exception filter reports "An unexpected error occurred", so the two most
 * likely things to go wrong when booking and paying both look like a server
 * fault the user can do nothing about.
 *
 * Anything unrecognised deliberately stays a 500 with no detail: an unmapped
 * database message can name a table, a constraint or a row.
 */
export function translateDatabaseError(error: unknown, fallback: string): AppException {
  const message = error instanceof Error ? error.message : String(error);

  if (/23P01|exclusion constraint|no_tutor_overlap|no_student_overlap/i.test(message)) {
    return new AppException(
      ErrorCode.CONFLICT,
      'That time is no longer available. Please choose another slot.',
      409,
    );
  }
  if (/ALREADY_PAID/.test(message)) {
    return new AppException(ErrorCode.CONFLICT, 'This booking has already been paid.', 409);
  }
  if (/BOOKING_NOT_PAYABLE/.test(message)) {
    return new AppException(
      ErrorCode.CONFLICT,
      'This booking can no longer be paid for.',
      409,
    );
  }
  if (/BOOKING_NOT_FOUND/.test(message)) {
    return new AppException(ErrorCode.NOT_FOUND, 'Booking not found.', 404);
  }
  if (/NOT_A_TUTOR/.test(message)) {
    return new AppException(ErrorCode.NOT_AUTHORIZED, 'This action is for tutors.', 403);
  }
  if (/NOT_AUTHORIZED/.test(message)) {
    return new AppException(
      ErrorCode.NOT_AUTHORIZED,
      'You do not have access to this record.',
      403,
    );
  }
  if (/CLASS_NOT_READY/.test(message)) {
    return new AppException(ErrorCode.CONFLICT, 'This class cannot be opened yet.', 409);
  }
  if (/HOURLY_RATE_ADMIN_ONLY/.test(message)) {
    return new AppException(
      ErrorCode.NOT_AUTHORIZED,
      'Only an administrator can change a tutor\u2019s hourly rate.',
      403,
    );
  }
  if (/BELOW_MINIMUM|INSUFFICIENT/i.test(message)) {
    return new AppException(
      ErrorCode.VALIDATION_FAILED,
      'That amount is below the minimum allowed.',
      400,
    );
  }
  if (/NO_QUOTE/.test(message)) {
    return new AppException(ErrorCode.NOT_FOUND, 'No price is available for this tutor.', 404);
  }

  return new AppException(ErrorCode.INTERNAL_ERROR, fallback, 500);
}
