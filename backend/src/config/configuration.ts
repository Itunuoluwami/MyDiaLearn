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
  port: parseInt(process.env.PORT as string, 10),
  apiPrefix: process.env.API_PREFIX as string,
  corsOrigin: process.env.CORS_ORIGIN as string,
  logLevel: process.env.LOG_LEVEL as string,
  isProduction: process.env.APP_ENV === 'production',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL as string,
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
  cookieSecure: process.env.APP_ENV === 'production',
}));

export const smtpConfig = registerAs('smtp', () => ({
  host: process.env.SMTP_HOST ?? '',
  port: parseInt(process.env.SMTP_PORT as string, 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  password: process.env.SMTP_PASSWORD ?? '',
  fromEmail: process.env.SMTP_FROM_EMAIL ?? '',
  fromName: process.env.SMTP_FROM_NAME as string,
}));

export const integrationsConfig = registerAs('integrations', () => ({
  email: process.env.EMAIL_PROVIDER as 'smtp' | 'log',
  payment: process.env.PAYMENT_PROVIDER as 'simulated',
  storage: process.env.STORAGE_PROVIDER as 'unconfigured',
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
