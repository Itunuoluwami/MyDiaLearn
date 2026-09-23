import './setup-env';

import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { Public } from '../src/common/decorators/public.decorator';

/**
 * Stand-in for a future feature controller.
 *
 * The foundation phase ships no protected endpoints, so without this there is
 * nothing to point the global guards at. Registering it in the root testing
 * module puts it under the same APP_GUARD chain a real controller would get.
 */
@Controller('probe')
class ProbeController {
  @Get('protected')
  protectedRoute(): { ok: boolean } {
    return { ok: true };
  }

  @Get('open')
  @Public()
  openRoute(): { ok: boolean } {
    return { ok: true };
  }
}

/**
 * Boots the real application graph — every module, guard, filter and
 * interceptor — with no database reachable.
 *
 * That is the point. If DI is misconfigured, a token is unbound or a guard
 * cannot resolve a dependency, the app will not start and these fail. It is
 * the cheapest check that the foundation actually holds together.
 */
describe('Application foundation (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProbeController],
    }).compile();
    app = moduleRef.createNestApplication({ bufferLogs: true });
    // The same configuration main.ts applies, so these assertions describe
    // the application that actually ships.
    configureApp(app);
    await app.init();
  }, 30_000);

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /health', () => {
    it('answers 200 even though the database is unreachable', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'degraded',
        service: 'dialearn-backend',
        env: 'test',
      });
      expect(response.body.checks.database.status).toBe('down');
      expect(typeof response.body.uptimeSeconds).toBe('number');
    });

    it('is reachable without authentication', async () => {
      // Every other route is behind the global JwtAuthGuard. @Public() on the
      // health controller is what keeps probes working.
      await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('sits outside the API prefix', async () => {
      await request(app.getHttpServer()).get('/api/health').expect(404);
    });

    it('returns a correlation id', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('echoes an inbound correlation id so a trace survives the hop', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('x-request-id', 'trace-from-frontend')
        .expect(200);

      expect(response.headers['x-request-id']).toBe('trace-from-frontend');
    });
  });

  describe('GET /health/live and /health/ready', () => {
    it('reports liveness without consulting dependencies', async () => {
      await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'ok' });
    });

    it('withholds readiness while the database is down', async () => {
      await request(app.getHttpServer())
        .get('/health/ready')
        .expect(503, { status: 'not_ready' });
    });
  });

  describe('authentication', () => {
    it('denies a declared route that does not opt out', async () => {
      await request(app.getHttpServer()).get('/api/probe/protected').expect(401);
    });

    it('allows a route marked @Public()', async () => {
      await request(app.getHttpServer()).get('/api/probe/open').expect(200, { ok: true });
    });

    it('rejects a malformed bearer token without revealing why', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/probe/protected')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);

      expect(response.body.code).toBe('UNAUTHENTICATED');
      expect(response.body.message).toBe('Invalid or expired access token.');
    });

    it('rejects a non-bearer Authorization scheme', async () => {
      await request(app.getHttpServer())
        .get('/api/probe/protected')
        .set('Authorization', 'Basic dXNlcjpwYXNz')
        .expect(401);
    });

    it('404s an unrouted path, because routing precedes the guard chain', async () => {
      // Worth pinning: guards run per matched handler, so an unknown path is
      // a 404 rather than a 401. Deny-by-default protects declared routes
      // that forget @Public(), not the absence of a route.
      await request(app.getHttpServer()).get('/api/does-not-exist').expect(404);
    });
  });

  describe('error envelope', () => {
    it('uses one shape for every failure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/probe/protected')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        code: 'UNAUTHENTICATED',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String),
        path: '/api/probe/protected',
      });
    });

    it('quotes the same correlation id in the body and the header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/probe/protected')
        .set('x-request-id', 'trace-abc')
        .expect(401);

      expect(response.body.requestId).toBe('trace-abc');
      expect(response.headers['x-request-id']).toBe('trace-abc');
    });

    it('never includes a stack trace', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/probe/protected')
        .expect(401);

      expect(JSON.stringify(response.body)).not.toContain('at ');
      expect(response.body).not.toHaveProperty('stack');
    });
  });

  describe('auth endpoints', () => {
    // These exercise the layers in front of the database — routing, the global
    // guard and DTO validation — so they run without one.

    it('protects /auth/me', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('exposes login and register without authentication', async () => {
      for (const path of ['/api/auth/login', '/api/auth/register']) {
        const response = await request(app.getHttpServer()).post(path).send({});
        // 401 would mean the global guard is wrongly in front of them. 400
        // means they are reachable and the empty body was rejected.
        expect(response.status).toBe(400);
      }
    });

    it('answers refresh without a cookie as a spent session, not a guard refusal', async () => {
      // Both are 401, so the status alone does not distinguish them. The
      // message does, and it matters: one means "sign in again", the other
      // would mean the endpoint had been accidentally put behind the guard.
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.message).toMatch(/session has expired/i);
      expect(response.body.message).not.toMatch(/access token/i);
    });

    it('rejects a login without credentials, naming both fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_FAILED');
      expect(JSON.stringify(response.body.details)).toMatch(/email/);
      expect(JSON.stringify(response.body.details)).toMatch(/password/);
    });

    it('does not apply the password policy to login', async () => {
      // An account created before a policy change still has to be able to sign
      // in, so `password` is only checked for presence here.
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ada@example.com', password: 'x' });

      expect(response.status).not.toBe(400);
    });

    it('enforces the password policy on registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'ada@example.com',
          password: 'weak',
          fullName: 'Ada Lovelace',
          role: 'parent',
        })
        .expect(400);

      expect(JSON.stringify(response.body.details)).toMatch(/at least 8 characters/);
    });

    it('refuses an elevated role at registration', async () => {
      // Self-service signup cannot mint an admin. handle_new_user() downgrades
      // one too, so this is the outer of two independent guards.
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'ada@example.com',
          password: 'Str0ng!Passw0rd',
          fullName: 'Ada Lovelace',
          role: 'super_admin',
        })
        .expect(400);

      expect(JSON.stringify(response.body.details)).toMatch(/valid role/);
    });

    it('strips properties the DTO does not declare', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ada@example.com', password: 'x', isAdmin: true })
        .expect(400);

      expect(JSON.stringify(response.body.details)).toMatch(/isAdmin/);
    });

    it('normalises the email before validating it', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: '  ADA@Example.COM  ', password: 'x' });

      // Trimmed and lowercased by the DTO transform, so this is not a
      // validation failure.
      expect(response.status).not.toBe(400);
    });
  });

  describe('security headers', () => {
    it('does not advertise the framework', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });
});
