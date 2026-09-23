import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { smtpConfig, type SmtpConfig } from '../../config/configuration';
import type { EmailMessage, EmailSendResult, EmailService } from './email.interface';

/**
 * SMTP delivery through DiaLearn's own mail server.
 *
 * The transport is created lazily. Building it in the constructor would make
 * an unreachable or misconfigured mail server a boot failure for the entire
 * API, and email is not critical-path for most of it.
 */
@Injectable()
export class SmtpEmailProvider implements EmailService {
  private transporter?: Transporter;

  constructor(
    @Inject(smtpConfig.KEY) private readonly config: SmtpConfig,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SmtpEmailProvider.name);
  }

  isReady(): boolean {
    return Boolean(this.config.host && this.config.fromEmail);
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.isReady()) {
      throw new Error(
        'SMTP is selected but not configured. Set SMTP_HOST and SMTP_FROM_EMAIL, ' +
          'or set EMAIL_PROVIDER=log.',
      );
    }

    const info = await this.transport().sendMail({
      from: { name: this.config.fromName, address: this.config.fromEmail },
      to: message.to,
      subject: message.subject,
      ...(message.text !== undefined && { text: message.text }),
      ...(message.html !== undefined && { html: message.html }),
      ...(message.replyTo !== undefined && { replyTo: message.replyTo }),
      ...(message.cc !== undefined && { cc: message.cc }),
      ...(message.bcc !== undefined && { bcc: message.bcc }),
    });

    // Recipients are logged; subject and body are not. Subjects here carry
    // one-time passwords and booking details.
    this.logger.info(
      { messageId: info.messageId, accepted: info.accepted?.length ?? 0 },
      'Email sent',
    );

    return {
      messageId: info.messageId,
      accepted: (info.accepted ?? []).map(String),
      rejected: (info.rejected ?? []).map(String),
    };
  }

  private transport(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        ...(this.config.user
          ? { auth: { user: this.config.user, pass: this.config.password } }
          : {}),
      });
    }
    return this.transporter;
  }
}
