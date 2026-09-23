import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap(): Promise<void> {
  // bufferLogs holds startup output until pino is available, so boot messages
  // land in the same structured stream as everything else.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = configureApp(app);
  const logger = app.get(Logger);

  await app.listen(config.port, '0.0.0.0');

  logger.log(
    `DiaLearn API listening on port ${config.port} ` +
      `(env=${config.env}, prefix=/${config.apiPrefix})`,
  );
}

void bootstrap();
