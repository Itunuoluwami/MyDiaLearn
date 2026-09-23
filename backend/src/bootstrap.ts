import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

import { appConfig, type AppConfig } from './config/configuration';
import { createValidationPipe } from './common/pipes/validation.pipe';

/**
 * Everything applied to the app instance that is not a module.
 *
 * Shared by main.ts and the e2e suite on purpose. When security headers, CORS
 * or the validation pipe are configured only in main.ts, tests exercise a
 * differently-configured application than the one that ships, and assertions
 * about those behaviours prove nothing.
 */
export function configureApp(app: INestApplication): AppConfig {
  const config = app.get<AppConfig>(appConfig.KEY);

  app.use(
    helmet({
      // This API serves JSON to a separately hosted frontend, so CSP and COEP
      // — which govern document loading — protect nothing here and complicate
      // local tooling. Transport and sniffing protections still apply.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  const origins = config.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    maxAge: 86_400,
  });

  // /health stays off the prefix so probes do not have to track API_PREFIX.
  app.setGlobalPrefix(config.apiPrefix, { exclude: ['health', 'health/{*path}'] });

  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  return config;
}
