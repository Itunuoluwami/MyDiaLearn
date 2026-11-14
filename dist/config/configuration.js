"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurations = exports.rateLimitConfig = exports.integrationsConfig = exports.smtpConfig = exports.authConfig = exports.jwtConfig = exports.databaseConfig = exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('app', () => ({
    env: process.env.APP_ENV,
    port: /^\d+$/.test(process.env.PORT ?? '')
        ? parseInt(process.env.PORT, 10)
        : process.env.PORT,
    apiPrefix: process.env.API_PREFIX,
    corsOrigin: process.env.CORS_ORIGIN,
    logLevel: process.env.LOG_LEVEL,
    isProduction: process.env.APP_ENV === 'production',
}));
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    appUrl: process.env.DATABASE_APP_URL ?? '',
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
}));
exports.authConfig = (0, config_1.registerAs)('auth', () => ({
    appUrl: process.env.APP_URL,
    emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
    emailVerificationTtlHours: parseInt(process.env.EMAIL_VERIFICATION_TTL_HOURS, 10),
    passwordResetTtlMinutes: parseInt(process.env.PASSWORD_RESET_TTL_MINUTES, 10),
    lockoutThreshold: parseInt(process.env.AUTH_LOCKOUT_THRESHOLD, 10),
    lockoutMinutes: parseInt(process.env.AUTH_LOCKOUT_MINUTES, 10),
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSameSite: process.env.COOKIE_SAME_SITE,
    cookieSecure: process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging',
}));
exports.smtpConfig = (0, config_1.registerAs)('smtp', () => ({
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    fromEmail: process.env.SMTP_FROM_EMAIL ?? '',
    fromName: process.env.SMTP_FROM_NAME,
    requireTls: process.env.SMTP_REQUIRE_TLS !== 'false',
    authMethod: (process.env.SMTP_AUTH_METHOD ?? ''),
}));
exports.integrationsConfig = (0, config_1.registerAs)('integrations', () => ({
    email: process.env.EMAIL_PROVIDER,
    payment: process.env.PAYMENT_PROVIDER,
    paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET ?? '',
    storage: process.env.STORAGE_PROVIDER,
    storageLocalPath: process.env.STORAGE_LOCAL_PATH,
    storageSigningSecret: process.env.STORAGE_SIGNING_SECRET ?? '',
    storageMaxUploadBytes: Math.round(parseFloat(process.env.STORAGE_MAX_UPLOAD_MB) * 1024 * 1024),
    classroom: process.env.CLASSROOM_PROVIDER,
}));
exports.rateLimitConfig = (0, config_1.registerAs)('rateLimit', () => ({
    ttlSeconds: parseInt(process.env.RATE_LIMIT_TTL_SECONDS, 10),
    max: parseInt(process.env.RATE_LIMIT_MAX, 10),
}));
exports.configurations = [
    exports.appConfig,
    exports.databaseConfig,
    exports.jwtConfig,
    exports.authConfig,
    exports.smtpConfig,
    exports.integrationsConfig,
    exports.rateLimitConfig,
];
//# sourceMappingURL=configuration.js.map