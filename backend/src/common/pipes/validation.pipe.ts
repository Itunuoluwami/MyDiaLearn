import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

/**
 * The global validation pipe.
 *
 * `whitelist` + `forbidNonWhitelisted` mean a request carrying a property the
 * DTO does not declare is rejected rather than silently ignored. That matters
 * more here than usual: the frontend currently posts straight to Postgres
 * functions with no client-side validation at all, so these DTOs are the first
 * and only place unexpected input is caught.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: false },
    // Flatten nested errors into "path: constraint" strings, which the
    // exception filter surfaces as `details`.
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({ message: flatten(errors) }),
  });
}

function flatten(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((m) => `${path}: ${m}`);
    const nested = error.children?.length ? flatten(error.children, path) : [];
    return [...own, ...nested];
  });
}
