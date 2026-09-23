import { Inject, Injectable } from '@nestjs/common';

import { appConfig, integrationsConfig } from '../config/configuration';
import type { AppConfig, IntegrationsConfig } from '../config/configuration';
import { PrismaService } from '../database/prisma.service';

export type ComponentStatus = 'up' | 'down' | 'not_configured';

export interface HealthReport {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  env: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: { status: ComponentStatus; latencyMs?: number; error?: string };
    integrations: Record<string, { adapter: string; status: ComponentStatus }>;
  };
}

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    @Inject(integrationsConfig.KEY) private readonly integrations: IntegrationsConfig,
  ) {}

  async report(): Promise<HealthReport> {
    const database = await this.checkDatabase();

    return {
      // `degraded` rather than a failure: the process is alive and answering,
      // which is what /health is asked to report. Whether traffic should be
      // routed here is a different question — see isReady().
      status: database.status === 'up' ? 'ok' : 'degraded',
      service: 'dialearn-backend',
      version: process.env.npm_package_version ?? '0.1.0',
      env: this.app.env,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks: {
        database,
        integrations: {
          email: { adapter: this.integrations.email, status: 'up' },
          payment: { adapter: this.integrations.payment, status: 'up' },
          storage: {
            adapter: this.integrations.storage,
            status: this.integrations.storage === 'unconfigured' ? 'not_configured' : 'up',
          },
          classroom: {
            adapter: this.integrations.classroom,
            status: this.integrations.classroom === 'none' ? 'not_configured' : 'up',
          },
        },
      },
    };
  }

  /** Strict check for a load balancer: false means do not send traffic. */
  async isReady(): Promise<boolean> {
    return (await this.checkDatabase()).status === 'up';
  }

  private async checkDatabase(): Promise<HealthReport['checks']['database']> {
    const startedAt = Date.now();
    try {
      await this.prisma.ping();
      return { status: 'up', latencyMs: Date.now() - startedAt };
    } catch (error) {
      // The message can name the host, the database and the user. None of that
      // belongs in an unauthenticated response body.
      return {
        status: 'down',
        error: error instanceof Error ? error.constructor.name : 'UnknownError',
      };
    }
  }
}
