import { Global, Module, Provider } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { EmailModule } from './email/email.module';

import { CLASSROOM_PROVIDER } from './classroom/classroom.interface';
import { NoneClassroomProvider } from './classroom/none-classroom.provider';
import { PAYMENT_PROVIDER } from './payments/payment.interface';
import { SimulatedPaymentProvider } from './payments/simulated-payment.provider';
import { STORAGE_PROVIDER } from './storage/storage.interface';
import { UnconfiguredStorageProvider } from './storage/unconfigured-storage.provider';

/**
 * Binds the payment, storage and classroom ports to adapters, chosen by
 * configuration. Email has outgrown this and lives in its own module.
 *
 * This module is the only place a concrete provider is named. Application
 * services inject the token — EMAIL_SERVICE, PAYMENT_PROVIDER — and cannot
 * tell which adapter answered, which is what lets a provider be replaced
 * without touching business logic.
 *
 * Adding a provider means writing an adapter, adding its name to the enum in
 * config/env.validation.ts, and adding a case below. Nothing else changes.
 */
const paymentProvider: Provider = {
  provide: PAYMENT_PROVIDER,
  inject: [PinoLogger],
  useFactory: (logger: PinoLogger) => new SimulatedPaymentProvider(logger),
};

const storageProvider: Provider = {
  provide: STORAGE_PROVIDER,
  useClass: UnconfiguredStorageProvider,
};

const classroomProvider: Provider = {
  provide: CLASSROOM_PROVIDER,
  useClass: NoneClassroomProvider,
};

@Global()
@Module({
  imports: [EmailModule],
  providers: [paymentProvider, storageProvider, classroomProvider],
  exports: [EmailModule, PAYMENT_PROVIDER, STORAGE_PROVIDER, CLASSROOM_PROVIDER],
})
export class IntegrationsModule {}
