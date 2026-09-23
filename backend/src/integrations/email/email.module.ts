import { Global, Module, type Provider } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { integrationsConfig, smtpConfig } from '../../config/configuration';
import type { IntegrationsConfig, SmtpConfig } from '../../config/configuration';
import { EmailAdminController } from './email.controller';
import { EMAIL_PROVIDER } from './email.interface';
import { EmailService } from './email.service';
import { LogEmailProvider } from './smtp/log-email.provider';
import { SmtpEmailProvider } from './smtp/smtp-email.provider';

/**
 * Outbound email.
 *
 * The only file that names a concrete provider. Business services inject
 * EmailService; nothing upstream can tell whether SMTP or the logging adapter
 * answered, which is what makes the provider replaceable.
 *
 * Adding one means writing an adapter that implements EmailProvider, adding
 * its name to the enum in config/env.validation.ts, and adding a case below.
 */
const emailProvider: Provider = {
  provide: EMAIL_PROVIDER,
  inject: [integrationsConfig.KEY, smtpConfig.KEY, PinoLogger],
  useFactory: (config: IntegrationsConfig, smtp: SmtpConfig, logger: PinoLogger) =>
    config.email === 'smtp'
      ? new SmtpEmailProvider(smtp, logger)
      : new LogEmailProvider(logger),
};

@Global()
@Module({
  controllers: [EmailAdminController],
  providers: [emailProvider, EmailService],
  exports: [EMAIL_PROVIDER, EmailService],
})
export class EmailModule {}
