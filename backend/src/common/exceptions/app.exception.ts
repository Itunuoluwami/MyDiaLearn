import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Stable, machine-readable error codes.
 *
 * Several mirror exceptions already raised by the PL/pgSQL functions this
 * backend will replace (NOT_AUTHORIZED, BOOKING_NOT_PAYABLE, ALREADY_PAID,
 * BOOKING_NOT_FOUND ...). Keeping the same vocabulary means a migrated
 * endpoint can be diffed against the RPC it replaces without the client having
 * to learn a second set of names.
 */
export enum ErrorCode {
  // Generic
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',

  // Auth
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Integrations
  INTEGRATION_UNAVAILABLE = 'INTEGRATION_UNAVAILABLE',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Base class for errors this application raises deliberately.
 *
 * The distinction matters to the exception filter: an AppException carries a
 * message meant for the caller, while anything else is treated as unexpected
 * and has its detail withheld in production.
 */
export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    status: HttpStatus,
    readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}

export class NotFoundError extends AppException {
  constructor(resource: string, details?: unknown) {
    super(ErrorCode.NOT_FOUND, `${resource} not found.`, HttpStatus.NOT_FOUND, details);
  }
}

export class NotAuthorizedError extends AppException {
  constructor(message = 'You do not have access to this resource.', details?: unknown) {
    super(ErrorCode.NOT_AUTHORIZED, message, HttpStatus.FORBIDDEN, details);
  }
}

export class UnauthenticatedError extends AppException {
  constructor(message = 'Authentication required.') {
    super(ErrorCode.UNAUTHENTICATED, message, HttpStatus.UNAUTHORIZED);
  }
}

export class ConflictError extends AppException {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT, details);
  }
}

/**
 * Raised by integration adapters that are wired but not configured — the
 * storage and classroom ports have no real provider yet, and saying so
 * explicitly beats a confusing null.
 */
export class NotImplementedError extends AppException {
  constructor(what: string) {
    super(
      ErrorCode.NOT_IMPLEMENTED,
      `${what} is not configured in this environment.`,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
