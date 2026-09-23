import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import { appConfig, databaseConfig } from '../config/configuration';
import type { AppConfig, DatabaseConfig } from '../config/configuration';

/**
 * The single point of database access for the whole backend.
 *
 * Built on the pg driver adapter rather than Prisma's own engine connection.
 * That is a deliberate choice for this codebase: the existing database relies
 * on 130 row-level security policies, and the option of preserving them means
 * issuing `SET LOCAL request.jwt.claims` per transaction. A real pg pool makes
 * that reachable later; Prisma's managed connection does not.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected = false;

  constructor(
    @Inject(databaseConfig.KEY) database: DatabaseConfig,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    private readonly logger: PinoLogger,
  ) {
    super({ adapter: new PrismaPg({ connectionString: database.url }) });
    this.logger.setContext(PrismaService.name);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      // $connect() with a driver adapter does not open a socket, so it
      // succeeds against a database that does not exist. Only a real query
      // proves the connection, and claiming otherwise in the startup log
      // sends whoever is debugging in exactly the wrong direction.
      await this.ping();
      this.connected = true;
      this.logger.info('Database connection verified');
    } catch (error) {
      this.connected = false;

      // In production an unreachable database is fatal — better to fail the
      // deploy than to serve an app that 500s on every request. Elsewhere it
      // is a warning, so the API still boots for local work and CI, with
      // /health reporting the database as down.
      if (this.app.isProduction) {
        this.logger.error({ err: error }, 'Database unreachable; refusing to start');
        throw error;
      }
      this.logger.warn(
        { err: error },
        'Database unreachable. Starting anyway because APP_ENV is not production — ' +
          'database-backed routes will fail and /health will report db: down.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Whether the initial connection succeeded. Used by the health check. */
  isConnected(): boolean {
    return this.connected;
  }

  /** Cheapest possible round trip, for liveness probes. */
  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}
