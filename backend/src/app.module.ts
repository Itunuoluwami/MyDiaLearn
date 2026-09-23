import { MiddlewareConsumer, Module, NestModule, OnModuleInit, Inject } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { AppConfigModule } from './config/config.module';
import {
  appConfig,
  integrationsConfig,
  jwtConfig,
  rateLimitConfig,
} from './config/configuration';
import type {
  AppConfig,
  IntegrationsConfig,
  JwtConfig,
  RateLimitConfig,
} from './config/configuration';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  RequestIdMiddleware,
  REQUEST_ID_HEADER,
} from './common/middleware/request-id.middleware';
import { AuditModule } from './common/audit/audit.module';
import { DatabaseModule } from './database/database.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';

import { AgenciesModule } from './agencies/agencies.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { FilesModule } from './files/files.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ParentsModule } from './parents/parents.module';
import { PaymentsModule } from './payments/payments.module';
import { StudentsModule } from './students/students.module';
import { TutorsModule } from './tutors/tutors.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AppConfigModule,

    /**
     * Structured JSON logs, one line per request, correlated by request id.
     *
     * Pretty-printed in development only — JSON is for log aggregation, not
     * for a human reading a terminal. Authorization headers and cookies are
     * redacted; a logged bearer token is a logged credential.
     */
    LoggerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (app: AppConfig) => ({
        pinoHttp: {
          level: app.logLevel,
          genReqId: (req: IncomingMessage, res: ServerResponse) => {
            const existing = req.headers[REQUEST_ID_HEADER];
            const id = (Array.isArray(existing) ? existing[0] : existing) || randomUUID();
            res.setHeader(REQUEST_ID_HEADER, id);
            return id;
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              'req.body.password',
              'req.body.confirmPassword',
              'req.body.otp',
            ],
            remove: true,
          },
          autoLogging: {
            // Probes would otherwise dominate the log volume.
            ignore: (req: IncomingMessage) => req.url?.startsWith('/health') ?? false,
          },
          ...(app.isProduction
            ? {}
            : { transport: { target: 'pino-pretty', options: { singleLine: true } } }),
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [rateLimitConfig.KEY],
      useFactory: (limits: RateLimitConfig) => ({
        throttlers: [{ ttl: limits.ttlSeconds * 1000, limit: limits.max }],
      }),
    }),

    /**
     * Global so JwtAuthGuard can inject JwtService without every feature
     * module importing it. Verification options are passed per call in the
     * guard; nothing is signed during the foundation phase.
     */
    JwtModule.registerAsync({
      global: true,
      inject: [jwtConfig.KEY],
      useFactory: (jwt: JwtConfig) => ({
        secret: jwt.secret,
        // jsonwebtoken types expiresIn as a `${number}${unit}` template union.
        // The value is a plain string from the environment, validated by Joi,
        // so the cast is asserting what validation already guarantees.
        signOptions: { expiresIn: jwt.accessExpiresIn } as JwtSignOptions,
      }),
    }),

    DatabaseModule,
    AuditModule,
    IntegrationsModule,
    PlatformSettingsModule,
    HealthModule,

    // Implemented domains.
    AuthModule,
    UsersModule,
    CatalogueModule,
    NotificationsModule,
    PaymentsModule,
    BookingsModule,
    TutorsModule,
    StudentsModule,
    ParentsModule,

    // Boundaries still to be filled. Each module's header names what it will
    // own and what it replaces.
    AgenciesModule,
    FilesModule,
  ],
  providers: [
    // Order matters: rate limiting rejects before any work is done,
    // authentication establishes who is calling, then role and permission
    // checks run against that identity.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },

    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    @Inject(integrationsConfig.KEY) private readonly integrations: IntegrationsConfig,
  ) {}

  onModuleInit(): void {
    // A simulated gateway in production would report every booking as paid
    // while no money moved. Refuse to start rather than discover that from
    // the settlement report.
    if (this.app.isProduction && this.integrations.payment === 'simulated') {
      throw new Error(
        'PAYMENT_PROVIDER=simulated is not permitted when APP_ENV=production. ' +
          'Configure a real payment provider before deploying.',
      );
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
