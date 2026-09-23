import { Test } from '@nestjs/testing';

import { appConfig, integrationsConfig } from '../config/configuration';
import { PrismaService } from '../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const buildModule = async (ping: () => Promise<void>) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { ping, isConnected: () => true } },
        {
          provide: appConfig.KEY,
          useValue: { env: 'test', isProduction: false, port: 3000 },
        },
        {
          provide: integrationsConfig.KEY,
          useValue: {
            email: 'log',
            payment: 'simulated',
            storage: 'unconfigured',
            classroom: 'none',
          },
        },
      ],
    }).compile();
    return moduleRef.get(HealthService);
  };

  it('reports ok when the database answers', async () => {
    const service = await buildModule(async () => undefined);
    const report = await service.report();

    expect(report.status).toBe('ok');
    expect(report.checks.database.status).toBe('up');
    expect(report.service).toBe('dialearn-backend');
  });

  it('reports degraded rather than throwing when the database is down', async () => {
    // The process is alive and answering; that is what /health reports. A
    // health endpoint that 500s when its dependency is down tells a monitor
    // nothing it could not already infer.
    const service = await buildModule(async () => {
      throw new Error('connect ECONNREFUSED 10.0.0.1:6432');
    });
    const report = await service.report();

    expect(report.status).toBe('degraded');
    expect(report.checks.database.status).toBe('down');
  });

  it('never leaks connection details from a database error', async () => {
    const service = await buildModule(async () => {
      throw new Error('password authentication failed for user "dialearn_app"');
    });
    const report = await service.report();
    const serialised = JSON.stringify(report);

    expect(serialised).not.toContain('password');
    expect(serialised).not.toContain('dialearn_app');
    expect(report.checks.database.error).toBe('Error');
  });

  it('marks unconfigured integrations rather than claiming they are up', async () => {
    const service = await buildModule(async () => undefined);
    const { integrations } = (await service.report()).checks;

    expect(integrations.storage).toEqual({
      adapter: 'unconfigured',
      status: 'not_configured',
    });
    expect(integrations.classroom).toEqual({ adapter: 'none', status: 'not_configured' });
    expect(integrations.email).toEqual({ adapter: 'log', status: 'up' });
  });

  it('withholds readiness while the database is down', async () => {
    const down = await buildModule(async () => {
      throw new Error('nope');
    });
    const up = await buildModule(async () => undefined);

    expect(await down.isReady()).toBe(false);
    expect(await up.isReady()).toBe(true);
  });
});
