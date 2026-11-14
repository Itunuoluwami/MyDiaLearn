export declare const appConfig: (() => {
    env: "development" | "test" | "staging" | "production";
    port: string | number;
    apiPrefix: string;
    corsOrigin: string;
    logLevel: string;
    isProduction: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: "development" | "test" | "staging" | "production";
    port: string | number;
    apiPrefix: string;
    corsOrigin: string;
    logLevel: string;
    isProduction: boolean;
}>;
export declare const databaseConfig: (() => {
    url: string;
    appUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    appUrl: string;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}>;
export declare const authConfig: (() => {
    appUrl: string;
    emailVerificationRequired: boolean;
    emailVerificationTtlHours: number;
    passwordResetTtlMinutes: number;
    lockoutThreshold: number;
    lockoutMinutes: number;
    cookieDomain: string | undefined;
    cookieSameSite: "lax" | "strict" | "none";
    cookieSecure: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    appUrl: string;
    emailVerificationRequired: boolean;
    emailVerificationTtlHours: number;
    passwordResetTtlMinutes: number;
    lockoutThreshold: number;
    lockoutMinutes: number;
    cookieDomain: string | undefined;
    cookieSameSite: "lax" | "strict" | "none";
    cookieSecure: boolean;
}>;
export declare const smtpConfig: (() => {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    requireTls: boolean;
    authMethod: "" | "LOGIN" | "PLAIN" | "CRAM-MD5";
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    requireTls: boolean;
    authMethod: "" | "LOGIN" | "PLAIN" | "CRAM-MD5";
}>;
export declare const integrationsConfig: (() => {
    email: "smtp" | "log";
    payment: "simulated";
    paymentWebhookSecret: string;
    storage: "unconfigured" | "local";
    storageLocalPath: string;
    storageSigningSecret: string;
    storageMaxUploadBytes: number;
    classroom: "none";
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    email: "smtp" | "log";
    payment: "simulated";
    paymentWebhookSecret: string;
    storage: "unconfigured" | "local";
    storageLocalPath: string;
    storageSigningSecret: string;
    storageMaxUploadBytes: number;
    classroom: "none";
}>;
export declare const rateLimitConfig: (() => {
    ttlSeconds: number;
    max: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    ttlSeconds: number;
    max: number;
}>;
export declare const configurations: (((() => {
    env: "development" | "test" | "staging" | "production";
    port: string | number;
    apiPrefix: string;
    corsOrigin: string;
    logLevel: string;
    isProduction: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: "development" | "test" | "staging" | "production";
    port: string | number;
    apiPrefix: string;
    corsOrigin: string;
    logLevel: string;
    isProduction: boolean;
}>) | ((() => {
    url: string;
    appUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    appUrl: string;
}>) | ((() => {
    secret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}>) | ((() => {
    appUrl: string;
    emailVerificationRequired: boolean;
    emailVerificationTtlHours: number;
    passwordResetTtlMinutes: number;
    lockoutThreshold: number;
    lockoutMinutes: number;
    cookieDomain: string | undefined;
    cookieSameSite: "lax" | "strict" | "none";
    cookieSecure: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    appUrl: string;
    emailVerificationRequired: boolean;
    emailVerificationTtlHours: number;
    passwordResetTtlMinutes: number;
    lockoutThreshold: number;
    lockoutMinutes: number;
    cookieDomain: string | undefined;
    cookieSameSite: "lax" | "strict" | "none";
    cookieSecure: boolean;
}>) | ((() => {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    requireTls: boolean;
    authMethod: "" | "LOGIN" | "PLAIN" | "CRAM-MD5";
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
    requireTls: boolean;
    authMethod: "" | "LOGIN" | "PLAIN" | "CRAM-MD5";
}>) | ((() => {
    email: "smtp" | "log";
    payment: "simulated";
    paymentWebhookSecret: string;
    storage: "unconfigured" | "local";
    storageLocalPath: string;
    storageSigningSecret: string;
    storageMaxUploadBytes: number;
    classroom: "none";
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    email: "smtp" | "log";
    payment: "simulated";
    paymentWebhookSecret: string;
    storage: "unconfigured" | "local";
    storageLocalPath: string;
    storageSigningSecret: string;
    storageMaxUploadBytes: number;
    classroom: "none";
}>) | ((() => {
    ttlSeconds: number;
    max: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    ttlSeconds: number;
    max: number;
}>))[];
export type AppConfig = ReturnType<typeof appConfig>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
export type AuthConfig = ReturnType<typeof authConfig>;
export type SmtpConfig = ReturnType<typeof smtpConfig>;
export type IntegrationsConfig = ReturnType<typeof integrationsConfig>;
export type RateLimitConfig = ReturnType<typeof rateLimitConfig>;
