import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IntegrationsConfig } from '../config/configuration';
import { EmailModule } from './email/email.module';

import { CLASSROOM_PROVIDER } from './classroom/classroom.interface';
import { NoneClassroomProvider } from './classroom/none-classroom.provider';
import { PaymentModule } from './payments/payment.module';
import { LocalDiskStorageProvider } from './storage/local-disk-storage.provider';
import { STORAGE_PROVIDER, type StorageProvider } from './storage/storage.interface';
import { UnconfiguredStorageProvider } from './storage/unconfigured-storage.provider';

/**
 * Binds the storage and classroom ports to adapters, chosen by configuration.
 * Email and payments have outgrown this and live in their own modules.
 *
 * This module is the only place a concrete provider is named. Application
 * services inject the token — EMAIL_SERVICE, PAYMENT_PROVIDER — and cannot
 * tell which adapter answered, which is what lets a provider be replaced
 * without touching business logic.
 *
 * Adding a provider means writing an adapter, adding its name to the enum in
 * config/env.validation.ts, and adding a case below. Nothing else changes.
 */
const storageProvider: Provider = {
  provide: STORAGE_PROVIDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): StorageProvider =>
    config.getOrThrow<IntegrationsConfig>('integrations').storage === 'local'
      ? new LocalDiskStorageProvider(config)
      : new UnconfiguredStorageProvider(),
};

const classroomProvider: Provider = {
  provide: CLASSROOM_PROVIDER,
  useClass: NoneClassroomProvider,
};

@Global()
@Module({
  imports: [EmailModule, PaymentModule],
  providers: [storageProvider, classroomProvider],
  exports: [EmailModule, PaymentModule, STORAGE_PROVIDER, CLASSROOM_PROVIDER],
})
export class IntegrationsModule {}
