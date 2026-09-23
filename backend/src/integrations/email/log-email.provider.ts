import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import type { EmailMessage, EmailSendResult, EmailService } from './email.interface';

/**
 * Writes email to the log instead of sending it. The default.
 *
 * Local development and CI must not need a reachable mail server, and must
 * never risk delivering to a real address while working with production-shaped
 * data. Selected by EMAIL_PROVIDER=log.
 */
@Injectable()
export class LogEmailProvider implements EmailService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LogEmailProvider.name);
  }

  isReady(): boolean {
    return true;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    this.logger.info(
      { to: recipients, subject: message.subject },
      'Email suppressed (EMAIL_PROVIDER=log)',
    );
    return {
      messageId: `log-${Date.now()}`,
      accepted: recipients,
      rejected: [],
    };
  }
}
