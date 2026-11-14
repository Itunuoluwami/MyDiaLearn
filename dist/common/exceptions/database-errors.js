"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateDatabaseError = translateDatabaseError;
const app_exception_1 = require("./app.exception");
function translateDatabaseError(error, fallback) {
    const message = error instanceof Error ? error.message : String(error);
    if (/23P01|exclusion constraint|no_tutor_overlap|no_student_overlap/i.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'That time is no longer available. Please choose another slot.', 409);
    }
    if (/ALREADY_PAID/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'This booking has already been paid.', 409);
    }
    if (/BOOKING_NOT_PAYABLE/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'This booking can no longer be paid for.', 409);
    }
    if (/BOOKING_NOT_FOUND/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_FOUND, 'Booking not found.', 404);
    }
    if (/NOT_A_TUTOR/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'This action is for tutors.', 403);
    }
    if (/NOT_AUTHORIZED/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'You do not have access to this record.', 403);
    }
    if (/CLASS_NOT_READY/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.CONFLICT, 'This class cannot be opened yet.', 409);
    }
    if (/HOURLY_RATE_ADMIN_ONLY/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_AUTHORIZED, 'Only an administrator can change a tutor\u2019s hourly rate.', 403);
    }
    if (/BELOW_MINIMUM|INSUFFICIENT/i.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'That amount is below the minimum allowed.', 400);
    }
    if (/NO_QUOTE/.test(message)) {
        return new app_exception_1.AppException(app_exception_1.ErrorCode.NOT_FOUND, 'No price is available for this tutor.', 404);
    }
    return new app_exception_1.AppException(app_exception_1.ErrorCode.INTERNAL_ERROR, fallback, 500);
}
//# sourceMappingURL=database-errors.js.map