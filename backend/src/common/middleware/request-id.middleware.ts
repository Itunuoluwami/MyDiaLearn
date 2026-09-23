import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Correlation ID for every request.
 *
 * An inbound x-request-id is honoured so a trace survives a hop from the
 * frontend or a proxy; otherwise one is minted. It is echoed on the response
 * and attached to the request so the logger and the exception filter can quote
 * the same value — which is what makes a user-reported error findable in logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming)?.trim() || randomUUID();

    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
