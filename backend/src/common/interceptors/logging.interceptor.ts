import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

import type { RequestWithUser } from '../decorators/current-user.decorator';

/**
 * Per-request timing, keyed by correlation ID.
 *
 * nestjs-pino already logs request completion; this adds the handler that ran
 * and the authenticated subject, which is what makes a slow endpoint
 * attributable. Deliberately logs no request body — bodies here carry
 * passwords, OTPs and payment details.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const handler = `${context.getClass().name}.${context.getHandler().name}`;
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.record(request, handler, startedAt, 'ok'),
        error: () => this.record(request, handler, startedAt, 'error'),
      }),
    );
  }

  private record(
    request: RequestWithUser,
    handler: string,
    startedAt: bigint,
    outcome: 'ok' | 'error',
  ): void {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    this.logger.debug(
      {
        requestId: request.requestId,
        handler,
        method: request.method,
        path: request.originalUrl ?? request.url,
        userId: request.user?.id,
        durationMs: Number(durationMs.toFixed(2)),
        outcome,
      },
      'request handled',
    );
  }
}
