import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { configurations } from './configuration';
import { envValidationSchema } from './env.validation';

/**
 * Global so no feature module has to re-import it to read configuration.
 *
 * `validationOptions.abortEarly: false` reports every environment problem at
 * once — one boot, one complete list, instead of fixing them one restart at a
 * time.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppConfigModule {}
