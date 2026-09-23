import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';

import { Public } from '../common/decorators/public.decorator';
import { HealthService, type HealthReport } from './health.service';

/**
 * Unauthenticated on purpose — a health endpoint that needs a token is useless
 * to a load balancer or an uptime monitor. It reveals only component status,
 * never connection details or error text.
 *
 * Throttling is skipped so that frequent probing cannot exhaust the rate limit
 * and take the endpoint down, which would invert its purpose.
 */
@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** Overall report. Always 200 while the process is answering. */
  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthReport> {
    return this.health.report();
  }

  /** Liveness: is the process up. No dependencies consulted. */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** Readiness: 503 when a dependency is down, so traffic is withheld. */
  @Get('ready')
  async ready(@Res({ passthrough: true }) response: Response): Promise<{ status: string }> {
    const ready = await this.health.isReady();
    response.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return { status: ready ? 'ready' : 'not_ready' };
  }
}
