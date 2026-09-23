import * as Joi from 'joi';

/**
 * Boot-time environment contract.
 *
 * The app refuses to start if this fails. That is deliberate: a backend that
 * boots with a missing DATABASE_URL or a default JWT secret is worse than one
 * that does not boot at all, because the failure surfaces later and further
 * from its cause.
 *
 * Secrets have no defaults. Anything with a default here is safe to be wrong.
 */
export const envValidationSchema = Joi.object({
  // --- Application ---------------------------------------------------------
  APP_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:8080')
    .description('Comma-separated list of allowed origins, or "*"'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),

  // --- Database ------------------------------------------------------------
  // Backend-only. This must never reach the frontend bundle: nothing here is
  // VITE_-prefixed, and the frontend's vite config only inlines VITE_*.
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),

  // --- Authentication ------------------------------------------------------
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters.',
  }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  // allow('') so that leaving the key present-but-blank in .env means "not
  // set" and falls back to JWT_SECRET, rather than failing validation.
  JWT_REFRESH_SECRET: Joi.string().min(32).allow('').optional(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // --- SMTP ----------------------------------------------------------------
  // Optional as a group: with EMAIL_PROVIDER=log the app runs without a mail
  // server, which is what local development and CI want.
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASSWORD: Joi.string().allow('').optional(),
  SMTP_FROM_EMAIL: Joi.string().email().allow('').optional(),
  SMTP_FROM_NAME: Joi.string().allow('').default('DiaLearn'),

  // --- Integration provider selection --------------------------------------
  // Which adapter is bound to each port. See src/integrations/.
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'log').default('log'),
  PAYMENT_PROVIDER: Joi.string().valid('simulated').default('simulated'),
  STORAGE_PROVIDER: Joi.string().valid('unconfigured').default('unconfigured'),
  CLASSROOM_PROVIDER: Joi.string().valid('none').default('none'),

  // --- Rate limiting -------------------------------------------------------
  RATE_LIMIT_TTL_SECONDS: Joi.number().positive().default(60),
  RATE_LIMIT_MAX: Joi.number().positive().default(120),
}).unknown(true);
