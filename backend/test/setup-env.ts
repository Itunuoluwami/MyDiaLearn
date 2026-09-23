/**
 * Environment for e2e runs.
 *
 * Set before the app module is imported so Joi validation passes without a
 * developer's real .env. The database URL points nowhere on purpose: the
 * suite asserts that the API boots and answers /health with the database
 * down, which is the behaviour a CI runner without Postgres depends on.
 */
process.env.APP_ENV = 'test';
process.env.PORT = '0';
process.env.API_PREFIX = 'api';
process.env.CORS_ORIGIN = 'http://localhost:8080';
process.env.LOG_LEVEL = 'silent';
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/dialearn_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.EMAIL_PROVIDER = 'log';
