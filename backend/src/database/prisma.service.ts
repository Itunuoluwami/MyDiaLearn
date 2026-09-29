import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
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
/**
 * How long a request may wait for a pooled connection before its transaction
 * starts. Prisma's default is 2 s; opening a connection to the remote
 * database can take longer than that, so a page that fires several requests
 * at once after an idle spell had some fail with "Unable to start a
 * transaction in the given time".
 */
const TRANSACTION_MAX_WAIT_MS = 10_000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected = false;

  constructor(
    @Inject(databaseConfig.KEY) database: DatabaseConfig,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    private readonly logger: PinoLogger,
  ) {
    // keepAlive stops idle pooled connections being dropped silently by the
    // network between bursts of traffic to the remote database.
    super({ adapter: new PrismaPg({ connectionString: database.url, keepAlive: true }) });
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

  /**
   * Runs work as a specific user, inside one transaction.
   *
   * This is the single most important method in the data layer. DiaLearn's
   * authorization lives in PostgreSQL — 123 RLS policies and 64 SECURITY
   * DEFINER functions, all resolving the caller through auth.uid(). Prisma
   * connects as one privileged role, so without this they would see either
   * nothing or everything.
   *
   * `SET LOCAL` scopes the claim to the transaction, so it cannot leak to the
   * next query that happens to reuse the pooled connection. That property is
   * what makes it safe under PgBouncer in transaction mode.
   *
   * Two consequences worth knowing:
   *  - Every statement in `fn` must use the transaction client it is handed.
   *    Using `this.prisma` directly inside would run outside the claim and
   *    silently lose the caller.
   *  - Because it is one transaction, multi-statement work is atomic for free,
   *    which is what several booking and payment paths need anyway.
   */
  async withUser<T>(
    userId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { role?: string; timeoutMs?: number },
  ): Promise<T> {
    const claims = JSON.stringify({
      sub: userId,
      role: options?.role ?? 'authenticated',
    });

    return this.$transaction(
      async (tx) => {
        // `true` is the is_local flag: reverted when the transaction ends.
        await tx.$executeRaw`select set_config('request.jwt.claims', ${claims}, true)`;
        return fn(tx);
      },
      { timeout: options?.timeoutMs ?? 15_000, maxWait: TRANSACTION_MAX_WAIT_MS },
    );
  }

  /**
   * Runs work with no caller set, so auth.uid() is null.
   *
   * For genuinely public reads — the tutor search and catalogue facets, which
   * anon could already call. Named explicitly so that using it is a visible
   * decision rather than an omission.
   */
  async asAnonymous<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.$transaction(
      async (tx) => {
        await tx.$executeRaw`select set_config('request.jwt.claims', '', true)`;
        return fn(tx);
      },
      { maxWait: TRANSACTION_MAX_WAIT_MS },
    );
  }
}
