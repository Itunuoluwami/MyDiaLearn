import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY, ROLES_KEY } from '../common/decorators/roles.decorator';
import { AgenciesController } from './agencies.controller';

describe('AgenciesController access', () => {
  const reflector = new Reflector();

  it('is for agency accounts holding agency.manage', () => {
    expect(reflector.get<string[]>(ROLES_KEY, AgenciesController)).toEqual(['agency']);
    expect(reflector.get<string[]>(PERMISSIONS_KEY, AgenciesController)).toEqual([
      'agency.manage',
    ]);
  });

  it('never overrides the gate on an individual route', () => {
    const proto = AgenciesController.prototype as unknown as Record<string, () => unknown>;
    for (const name of Object.getOwnPropertyNames(AgenciesController.prototype)) {
      if (name === 'constructor') continue;
      expect(reflector.get<string[] | undefined>(ROLES_KEY, proto[name]!)).toBeUndefined();
      expect(
        reflector.get<string[] | undefined>(PERMISSIONS_KEY, proto[name]!),
      ).toBeUndefined();
    }
  });
});
