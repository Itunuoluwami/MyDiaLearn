import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

async function bootstrap(): Promise<void> {
  // bufferLogs holds startup output until pino is available, so boot messages
  // land in the same structured stream as everything else.
  // rawBody keeps the exact request bytes alongside the parsed JSON: payment
  // webhooks are signed over those bytes, and re-serialising the parsed body
  // would not reproduce them.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  app.useLogger(app.get(Logger));

  const config = configureApp(app);
  const logger = app.get(Logger);

  if (typeof config.port === 'string') {
    // Hosted under IIS: iisnode proxies to a named pipe, so the socket has no
    // client address. web.config sets enableXFF, and trusting exactly one hop
    // takes the address IIS appended — not one a client wrote into the header,
    // which the rate limiter would otherwise believe.
    (app.getHttpAdapter().getInstance() as { set: (k: string, v: unknown) => void }).set(
      'trust proxy',
      1,
    );
    await app.listen(config.port);
  } else {
    await app.listen(config.port, '0.0.0.0');
  }

  logger.log(
    `DiaLearn API listening on port ${config.port} ` +
      `(env=${config.env}, prefix=/${config.apiPrefix})`,
  );
}

void bootstrap();
