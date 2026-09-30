import { registerAs } from '@nestjs/config';

/**
 * Typed configuration namespaces.
 *
 * Nothing outside this directory reads process.env. Modules inject the
 * namespace they need, which keeps the environment contract in one place and
 * makes configuration trivially fakeable in tests.
 */

export const appConfig = registerAs('app', () => ({
  env: process.env.APP_ENV as 'development' | 'test' | 'staging' | 'production',
  // iisnode passes a named pipe path rather than a number.
  port: /^\d+$/.test(process.env.PORT ?? '')
    ? parseInt(process.env.PORT as string, 10)
    : (process.env.PORT as string),
  apiPrefix: process.env.API_PREFIX as string,
  corsOrigin: process.env.CORS_ORIGIN as string,
  logLevel: process.env.LOG_LEVEL as string,
  isProduction: process.env.APP_ENV === 'production',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL as string,
  /**
   * Optional second login without table ownership. When set, per-user work
   * (withUser / asAnonymous) runs through it, so PostgreSQL's row-level
   * security applies; DATABASE_URL remains for system work. See
   * docs/deployment-smarterasp.md, "Restricted database user".
   */
  appUrl: process.env.DATABASE_APP_URL ?? '',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET as string,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
  refreshSecret: (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
}));

export const authConfig = registerAs('auth', () => ({
  appUrl: process.env.APP_URL as string,
  emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
  emailVerificationTtlHours: parseInt(process.env.EMAIL_VERIFICATION_TTL_HOURS as string, 10),
  passwordResetTtlMinutes: parseInt(process.env.PASSWORD_RESET_TTL_MINUTES as string, 10),
  lockoutThreshold: parseInt(process.env.AUTH_LOCKOUT_THRESHOLD as string, 10),
  lockoutMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES as string, 10),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSameSite: process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
  // Any hosted environment is served over HTTPS; only local work is plain HTTP.
  cookieSecure: process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging',
}));

export const smtpConfig = registerAs('smtp', () => ({
  host: process.env.SMTP_HOST ?? '',
  port: parseInt(process.env.SMTP_PORT as string, 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  password: process.env.SMTP_PASSWORD ?? '',
  fromEmail: process.env.SMTP_FROM_EMAIL ?? '',
  fromName: process.env.SMTP_FROM_NAME as string,
  requireTls: process.env.SMTP_REQUIRE_TLS !== 'false',
  authMethod: (process.env.SMTP_AUTH_METHOD ?? '') as '' | 'LOGIN' | 'PLAIN' | 'CRAM-MD5',
}));

export const integrationsConfig = registerAs('integrations', () => ({
  email: process.env.EMAIL_PROVIDER as 'smtp' | 'log',
  payment: process.env.PAYMENT_PROVIDER as 'simulated',
  /** Shared secret the payment adapter verifies webhooks with. Never logged. */
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? '',
  storage: process.env.STORAGE_PROVIDER as 'unconfigured' | 'local',
  storageLocalPath: process.env.STORAGE_LOCAL_PATH as string,
  /** Never logged. Empty means derive from JWT_SECRET. */
  storageSigningSecret: process.env.STORAGE_SIGNING_SECRET ?? '',
  storageMaxUploadBytes: Math.round(
    parseFloat(process.env.STORAGE_MAX_UPLOAD_MB as string) * 1024 * 1024,
  ),
  classroom: process.env.CLASSROOM_PROVIDER as 'none',
}));

export const rateLimitConfig = registerAs('rateLimit', () => ({
  ttlSeconds: parseInt(process.env.RATE_LIMIT_TTL_SECONDS as string, 10),
  max: parseInt(process.env.RATE_LIMIT_MAX as string, 10),
}));

export const configurations = [
  appConfig,
  databaseConfig,
  jwtConfig,
  authConfig,
  smtpConfig,
  integrationsConfig,
  rateLimitConfig,
];

export type AppConfig = ReturnType<typeof appConfig>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
export type AuthConfig = ReturnType<typeof authConfig>;
export type SmtpConfig = ReturnType<typeof smtpConfig>;
export type IntegrationsConfig = ReturnType<typeof integrationsConfig>;
export type RateLimitConfig = ReturnType<typeof rateLimitConfig>;
