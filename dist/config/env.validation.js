"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    APP_ENV: Joi.string()
        .valid('development', 'test', 'staging', 'production')
        .default('development'),
    PORT: Joi.alternatives()
        .try(Joi.number().port(), Joi.string().pattern(/^\\\\\.\\pipe\\/))
        .default(3000),
    API_PREFIX: Joi.string().default('api'),
    CORS_ORIGIN: Joi.string()
        .default('http://localhost:8080')
        .description('Comma-separated list of allowed origins, or "*"'),
    LOG_LEVEL: Joi.string()
        .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
        .default('info'),
    DATABASE_URL: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .required(),
    DATABASE_APP_URL: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .allow('')
        .optional(),
    JWT_SECRET: Joi.string().min(32).required().messages({
        'string.min': 'JWT_SECRET must be at least 32 characters.',
    }),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().min(32).allow('').optional(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    APP_URL: Joi.string().uri().default('http://localhost:8080'),
    EMAIL_VERIFICATION_REQUIRED: Joi.boolean().default(true),
    EMAIL_VERIFICATION_TTL_HOURS: Joi.number().positive().default(24),
    PASSWORD_RESET_TTL_MINUTES: Joi.number().positive().default(60),
    AUTH_LOCKOUT_THRESHOLD: Joi.number().positive().default(10),
    AUTH_LOCKOUT_MINUTES: Joi.number().positive().default(15),
    COOKIE_DOMAIN: Joi.string().allow('').optional(),
    COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
    SMTP_HOST: Joi.string().allow('').optional(),
    SMTP_PORT: Joi.number().port().default(587),
    SMTP_SECURE: Joi.boolean().default(false),
    SMTP_USER: Joi.string().allow('').optional(),
    SMTP_PASSWORD: Joi.string().allow('').optional(),
    SMTP_FROM_EMAIL: Joi.string().email().allow('').optional(),
    SMTP_FROM_NAME: Joi.string().allow('').default('DiaLearn'),
    SMTP_REQUIRE_TLS: Joi.boolean().default(true),
    SMTP_AUTH_METHOD: Joi.string().valid('', 'LOGIN', 'PLAIN', 'CRAM-MD5').default(''),
    EMAIL_PROVIDER: Joi.string().valid('smtp', 'log').default('log'),
    PAYMENT_PROVIDER: Joi.string().valid('simulated').default('simulated'),
    PAYMENT_WEBHOOK_SECRET: Joi.string().min(16).allow('').optional(),
    STORAGE_PROVIDER: Joi.string().valid('unconfigured', 'local').default('unconfigured'),
    STORAGE_LOCAL_PATH: Joi.string().default('App_Data/uploads'),
    STORAGE_SIGNING_SECRET: Joi.string().min(32).allow('').optional(),
    STORAGE_MAX_UPLOAD_MB: Joi.number().positive().max(100).default(10),
    CLASSROOM_PROVIDER: Joi.string().valid('none').default('none'),
    RATE_LIMIT_TTL_SECONDS: Joi.number().positive().default(60),
    RATE_LIMIT_MAX: Joi.number().positive().default(120),
}).unknown(true);
//# sourceMappingURL=env.validation.js.map