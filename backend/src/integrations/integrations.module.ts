import { Global, Module, Provider } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { integrationsConfig, smtpConfig } from '../config/configuration';
import type { IntegrationsConfig, SmtpConfig } from '../config/configuration';

import { CLASSROOM_PROVIDER } from './classroom/classroom.interface';
import { NoneClassroomProvider } from './classroom/none-classroom.provider';
import { EMAIL_SERVICE } from './email/email.interface';
import { LogEmailProvider } from './email/log-email.provider';
import { SmtpEmailProvider } from './email/smtp-email.provider';
import { PAYMENT_PROVIDER } from './payments/payment.interface';
import { SimulatedPaymentProvider } from './payments/simulated-payment.provider';
import { STORAGE_PROVIDER } from './storage/storage.interface';
import { UnconfiguredStorageProvider } from './storage/unconfigured-storage.provider';

/**
 * Binds each integration port to an adapter, chosen by configuration.
 *
 * This module is the only place a concrete provider is named. Application
 * services inject the token — EMAIL_SERVICE, PAYMENT_PROVIDER — and cannot
 * tell which adapter answered, which is what lets a provider be replaced
 * without touching business logic.
 *
 * Adding a provider means writing an adapter, adding its name to the enum in
 * config/env.validation.ts, and adding a case below. Nothing else changes.
 */
const emailProvider: Provider = {
  provide: EMAIL_SERVICE,
  inject: [integrationsConfig.KEY, smtpConfig.KEY, PinoLogger],
  useFactory: (config: IntegrationsConfig, smtp: SmtpConfig, logger: PinoLogger) =>
    config.email === 'smtp'
      ? new SmtpEmailProvider(smtp, logger)
      : new LogEmailProvider(logger),
};

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
  providers: [emailProvider, paymentProvider, storageProvider, classroomProvider],
  exports: [EMAIL_SERVICE, PAYMENT_PROVIDER, STORAGE_PROVIDER, CLASSROOM_PROVIDER],
})
export class IntegrationsModule {}
