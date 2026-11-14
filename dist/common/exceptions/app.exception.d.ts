import { HttpException, HttpStatus } from '@nestjs/common';
export declare enum ErrorCode {
    VALIDATION_FAILED = "VALIDATION_FAILED",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    UNAUTHENTICATED = "UNAUTHENTICATED",
    NOT_AUTHORIZED = "NOT_AUTHORIZED",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    INTEGRATION_UNAVAILABLE = "INTEGRATION_UNAVAILABLE",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"
}
export declare class AppException extends HttpException {
    readonly code: ErrorCode;
    readonly details?: unknown | undefined;
    constructor(code: ErrorCode, message: string, status: HttpStatus, details?: unknown | undefined);
}
export declare class NotFoundError extends AppException {
    constructor(resource: string, details?: unknown);
}
export declare class NotAuthorizedError extends AppException {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthenticatedError extends AppException {
    constructor(message?: string);
}
export declare class ConflictError extends AppException {
    constructor(message: string, details?: unknown);
}
export declare class NotImplementedError extends AppException {
    constructor(what: string);
}
