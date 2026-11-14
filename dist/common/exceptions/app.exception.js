"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = exports.ConflictError = exports.UnauthenticatedError = exports.NotAuthorizedError = exports.NotFoundError = exports.AppException = exports.ErrorCode = void 0;
const common_1 = require("@nestjs/common");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ErrorCode["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    ErrorCode["NOT_AUTHORIZED"] = "NOT_AUTHORIZED";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["INTEGRATION_UNAVAILABLE"] = "INTEGRATION_UNAVAILABLE";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class AppException extends common_1.HttpException {
    code;
    details;
    constructor(code, message, status, details) {
        super({ code, message, details }, status);
        this.code = code;
        this.details = details;
    }
}
exports.AppException = AppException;
class NotFoundError extends AppException {
    constructor(resource, details) {
        super(ErrorCode.NOT_FOUND, `${resource} not found.`, common_1.HttpStatus.NOT_FOUND, details);
    }
}
exports.NotFoundError = NotFoundError;
class NotAuthorizedError extends AppException {
    constructor(message = 'You do not have access to this resource.', details) {
        super(ErrorCode.NOT_AUTHORIZED, message, common_1.HttpStatus.FORBIDDEN, details);
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
class UnauthenticatedError extends AppException {
    constructor(message = 'Authentication required.') {
        super(ErrorCode.UNAUTHENTICATED, message, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
class ConflictError extends AppException {
    constructor(message, details) {
        super(ErrorCode.CONFLICT, message, common_1.HttpStatus.CONFLICT, details);
    }
}
exports.ConflictError = ConflictError;
class NotImplementedError extends AppException {
    constructor(what) {
        super(ErrorCode.NOT_IMPLEMENTED, `${what} is not configured in this environment.`, common_1.HttpStatus.NOT_IMPLEMENTED);
    }
}
exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=app.exception.js.map