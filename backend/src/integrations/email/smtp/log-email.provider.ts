import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import type {
  EmailHealth,
  EmailMessage,
  EmailProvider,
  EmailSendResult,
} from '../email.interface';
import { maskAddress } from '../email.masking';

/**
 * Writes email to the log instead of sending it. The default.
 *
 * Local development and CI must not need a reachable mail server, and must
 * never risk delivering to a real address while working with production-shaped
 * data. Selected by EMAIL_PROVIDER=log.
 *
 * The body is logged at debug level only, so a developer can read a reset link
 * during local work without one appearing in an aggregated production log.
 */
@Injectable()
export class LogEmailProvider implements EmailProvider {
  readonly name = 'log';

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LogEmailProvider.name);
  }

  isConfigured(): boolean {
    return true;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];

    this.logger.info(
      { to: recipients.map(maskAddress), subject: message.subject },
      'Email suppressed (EMAIL_PROVIDER=log)',
    );
    this.logger.debug({ text: message.text }, 'Suppressed email body');

    return {
      messageId: `log-${Date.now()}`,
      accepted: recipients,
      rejected: [],
      provider: this.name,
      attempts: 1,
    };
  }

  async verifyConnection(): Promise<EmailHealth> {
    return {
      status: 'ok',
      provider: this.name,
      detail: 'Logging provider: nothing is delivered.',
      warnings: ['EMAIL_PROVIDER=log — no email is actually sent.'],
    };
  }
}
