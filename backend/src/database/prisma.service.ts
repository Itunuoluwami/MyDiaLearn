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

  /**
   * The restricted login, when DATABASE_APP_URL is set. It owns nothing, so
   * the RLS policies bind it; `this` (the owner) is kept for system work that
   * has no user — token housekeeping, webhooks, audit.
   */
  private readonly restricted: PrismaClient | null;

  constructor(
    @Inject(databaseConfig.KEY) database: DatabaseConfig,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    private readonly logger: PinoLogger,
  ) {
    // keepAlive stops idle pooled connections being dropped silently by the
    // network between bursts of traffic to the remote database.
    super({ adapter: new PrismaPg(PrismaService.poolOptions(database.url)) });
    this.restricted = database.appUrl
      ? new PrismaClient({
          adapter: new PrismaPg(PrismaService.poolOptions(database.appUrl)),
        })
      : null;
    this.logger.setContext(PrismaService.name);
  }

  /**
   * Connection options, with the session pinned to UTC.
   *
   * This database server runs on America/Los_Angeles, and reading a
   * `timestamptz` back through the driver adapter on a non-UTC session
   * returned the wall-clock time relabelled as UTC — eight hours adrift. The
   * stored value was always correct; everything the API said about it was not,
   * so a notification raised a minute ago arrived in the UI as "8 hours ago"
   * and every booking and payment time was wrong by the same amount.
   *
   * Pinning the session removes the ambiguity at the source rather than
   * correcting for it at each call site, and costs nothing: all timestamps in
   * this schema are `timestamptz`, which is absolute.
   */
  private static poolOptions(connectionString: string) {
    return { connectionString, keepAlive: true, options: '-c timezone=UTC' };
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      // $connect() with a driver adapter does not open a socket, so it
      // succeeds against a database that does not exist. Only a real query
      // proves the connection, and claiming otherwise in the startup log
      // sends whoever is debugging in exactly the wrong direction.
      await this.ping();
      if (this.restricted) {
        await this.restricted.$queryRaw`SELECT 1`;
        this.logger.info('Restricted database login verified; row-level security applies');
      }
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
    await Promise.all([this.$disconnect(), this.restricted?.$disconnect()]);
  }

  /** Whether per-user work runs under row-level security. */
  usesRestrictedLogin(): boolean {
    return this.restricted !== null;
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

    return (this.restricted ?? this).$transaction(
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
    return (this.restricted ?? this).$transaction(
      async (tx) => {
        await tx.$executeRaw`select set_config('request.jwt.claims', '', true)`;
        return fn(tx);
      },
      { maxWait: TRANSACTION_MAX_WAIT_MS },
    );
  }
}
