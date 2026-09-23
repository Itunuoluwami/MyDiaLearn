import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';

import { AppException, ErrorCode } from '../exceptions/app.exception';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

/**
 * One error shape for the whole API.
 *
 * Two rules drive this filter:
 *
 * 1. Every failure answers with the same JSON body, so the frontend needs one
 *    error handler rather than one per endpoint.
 * 2. Unexpected errors never reveal their detail to the caller. A thrown
 *    Error's message can easily contain a connection string or a row of user
 *    data; it is logged in full and replaced with a generic message in the
 *    response. Errors this application raises on purpose (AppException) are
 *    written for the caller and are passed through as-is.
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request as Request & { requestId?: string }).requestId ??
      (response.getHeader(REQUEST_ID_HEADER) as string) ??
      'unknown';

    const { status, code, message, details } = this.describe(exception);

    const body: ApiErrorBody = {
      statusCode: status,
      code,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      ...(details !== undefined && { details }),
    };

    // 5xx is our fault and gets the stack. 4xx is the caller's and does not —
    // logging a stack for every failed validation buries the real incidents.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { err: exception, requestId, path: body.path, code },
        'Unhandled exception',
      );
    } else {
      this.logger.warn({ requestId, path: body.path, code, status }, message);
    }

    response.status(status).json(body);
  }

  private describe(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: this.messageOf(exception),
        details: exception.details,
      };
    }

    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        code: ErrorCode.RATE_LIMITED,
        message: 'Too many requests. Please slow down.',
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      // The global ValidationPipe throws a BadRequestException whose response
      // carries an array of messages. Surface those as `details` rather than
      // flattening them into one unreadable string.
      if (typeof payload === 'object' && payload !== null) {
        const { message, error } = payload as { message?: unknown; error?: unknown };
        if (Array.isArray(message)) {
          return {
            status,
            code: ErrorCode.VALIDATION_FAILED,
            message: 'Request validation failed.',
            details: message,
          };
        }
        return {
          status,
          code: this.codeForStatus(status),
          message:
            typeof message === 'string'
              ? message
              : typeof error === 'string'
                ? error
                : exception.message,
        };
      }

      return {
        status,
        code: this.codeForStatus(status),
        message: typeof payload === 'string' ? payload : exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred.',
    };
  }

  private messageOf(exception: AppException): string {
    const payload = exception.getResponse();
    if (typeof payload === 'object' && payload !== null) {
      const { message } = payload as { message?: unknown };
      if (typeof message === 'string') return message;
    }
    return exception.message;
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.NOT_AUTHORIZED;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.NOT_IMPLEMENTED:
        return ErrorCode.NOT_IMPLEMENTED;
      default:
        return status >= 500 ? ErrorCode.INTERNAL_ERROR : 'HTTP_ERROR';
    }
  }
}
