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
  // A TCP port, or — under IIS/iisnode — the named pipe iisnode assigns.
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

  // --- Database ------------------------------------------------------------
  // Backend-only. This must never reach the frontend bundle: nothing here is
  // VITE_-prefixed, and the frontend's vite config only inlines VITE_*.
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  // Optional restricted login (no table ownership), so row-level security
  // applies to per-user work. Empty keeps everything on DATABASE_URL.
  DATABASE_APP_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .allow('')
    .optional(),

  // --- Authentication ------------------------------------------------------
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters.',
  }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  // allow('') so that leaving the key present-but-blank in .env means "not
  // set" and falls back to JWT_SECRET, rather than failing validation.
  JWT_REFRESH_SECRET: Joi.string().min(32).allow('').optional(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // --- Authentication behaviour ----------------------------------------------
  // Public origin of the frontend, used to build links in verification and
  // password-reset emails. Must match what the user actually browses to.
  APP_URL: Joi.string().uri().default('http://localhost:8080'),
  // Supabase required email confirmation before sign-in; default matches.
  EMAIL_VERIFICATION_REQUIRED: Joi.boolean().default(true),
  EMAIL_VERIFICATION_TTL_HOURS: Joi.number().positive().default(24),
  PASSWORD_RESET_TTL_MINUTES: Joi.number().positive().default(60),
  // Account-level lockout, on top of the IP-level throttler. Both are needed:
  // the throttler stops one host hammering many accounts, this stops many
  // hosts hammering one account.
  AUTH_LOCKOUT_THRESHOLD: Joi.number().positive().default(10),
  AUTH_LOCKOUT_MINUTES: Joi.number().positive().default(15),
  // Cookie flags. Secure is forced on in production regardless.
  COOKIE_DOMAIN: Joi.string().allow('').optional(),
  COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),

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
  // Force STARTTLS on a non-secure port. True for 587 (STARTTLS submission);
  // must be false for a plain submission port that offers no STARTTLS (8889).
  SMTP_REQUIRE_TLS: Joi.boolean().default(true),
  // Pin the SMTP auth mechanism. Empty = let nodemailer negotiate. Set to
  // CRAM-MD5 on a non-TLS port so the password is not sent base64-in-clear.
  SMTP_AUTH_METHOD: Joi.string().valid('', 'LOGIN', 'PLAIN', 'CRAM-MD5').default(''),

  // --- Integration provider selection --------------------------------------
  // Which adapter is bound to each port. See src/integrations/.
  EMAIL_PROVIDER: Joi.string().valid('smtp', 'log').default('log'),
  PAYMENT_PROVIDER: Joi.string().valid('simulated').default('simulated'),
  // Webhook signing secret for the payment provider. Optional: with none set,
  // every payment webhook is refused.
  PAYMENT_WEBHOOK_SECRET: Joi.string().min(16).allow('').optional(),
  STORAGE_PROVIDER: Joi.string().valid('unconfigured', 'local').default('unconfigured'),
  // local: where uploads are written. Relative paths resolve against the
  // working directory; the default sits under App_Data, which IIS never serves.
  STORAGE_LOCAL_PATH: Joi.string().default('App_Data/uploads'),
  // Signs short-lived download links. Optional: derived from JWT_SECRET when
  // empty, but a distinct value lets links be revoked without logging everyone out.
  STORAGE_SIGNING_SECRET: Joi.string().min(32).allow('').optional(),
  // Mirrors the 10 MB limit the upload screens already state.
  STORAGE_MAX_UPLOAD_MB: Joi.number().positive().max(100).default(10),
  CLASSROOM_PROVIDER: Joi.string().valid('none').default('none'),

  // --- Rate limiting -------------------------------------------------------
  RATE_LIMIT_TTL_SECONDS: Joi.number().positive().default(60),
  RATE_LIMIT_MAX: Joi.number().positive().default(120),
}).unknown(true);
