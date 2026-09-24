import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { smtpConfig, type SmtpConfig } from '../../../config/configuration';
import { classifyEmailError } from '../email.errors';
import type {
  EmailHealth,
  EmailMessage,
  EmailProvider,
  EmailSendResult,
} from '../email.interface';

/** Bounded so a wedged connection cannot hold a request open indefinitely. */
const CONNECTION_TIMEOUT_MS = 10_000;
const GREETING_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 20_000;

/**
 * SMTP delivery through DiaLearn's own mail server.
 *
 * Nodemailer appears in this file and nowhere else. Everything upstream —
 * EmailService, the auth and booking flows — depends on the EmailProvider
 * interface, so replacing SMTP with an HTTP API provider is a new adapter and
 * one line in EmailModule.
 *
 * The transport is created lazily and pooled. Building it in the constructor
 * would make an unreachable mail server a boot failure for the whole API, and
 * email is not on the critical path for most of it.
 */
@Injectable()
export class SmtpEmailProvider implements EmailProvider, OnModuleDestroy {
  readonly name = 'smtp';
  private transporter?: Transporter;

  constructor(
    @Inject(smtpConfig.KEY) private readonly config: SmtpConfig,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SmtpEmailProvider.name);
    for (const warning of this.configurationWarnings()) {
      this.logger.warn({ warning }, 'SMTP configuration looks wrong');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.config.host && this.config.fromEmail);
  }

  /**
   * Problems detectable without contacting the server.
   *
   * The port/secure mismatch is the one that actually bites: 465 is implicit
   * TLS (secure=true) and 587 is STARTTLS (secure=false). Getting it backwards
   * produces a connection that hangs until timeout rather than a clear error.
   */
  configurationWarnings(): string[] {
    const warnings: string[] = [];
    if (!this.config.host) warnings.push('SMTP_HOST is not set.');
    if (!this.config.fromEmail) warnings.push('SMTP_FROM_EMAIL is not set.');
    if (this.config.host && !this.config.user) {
      warnings.push('SMTP_USER is not set; the server will be contacted unauthenticated.');
    }
    if (this.config.port === 587 && this.config.secure) {
      warnings.push(
        'SMTP_PORT=587 with SMTP_SECURE=true: port 587 expects STARTTLS, so SMTP_SECURE should be false. ' +
          'As configured the connection will hang until it times out.',
      );
    }
    if (this.config.port === 465 && !this.config.secure) {
      warnings.push('SMTP_PORT=465 with SMTP_SECURE=false: port 465 expects implicit TLS.');
    }
    if (
      !this.config.secure &&
      !this.config.requireTls &&
      this.config.authMethod !== 'CRAM-MD5'
    ) {
      warnings.push(
        'A non-TLS port (SMTP_REQUIRE_TLS=false) without SMTP_AUTH_METHOD=CRAM-MD5 sends the ' +
          'password base64-encoded in clear. Prefer 587 with STARTTLS, or set CRAM-MD5.',
      );
    }
    return warnings;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.isConfigured()) {
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
      ...(message.headers !== undefined && { headers: message.headers }),
    });

    return {
      messageId: info.messageId,
      accepted: (info.accepted ?? []).map(String),
      rejected: (info.rejected ?? []).map(String),
      provider: this.name,
      attempts: 1,
    };
  }

  /**
   * Opens a connection and authenticates without sending anything.
   *
   * Reports host, port and TLS mode but never the username or password, and
   * never the raw provider message — a rejection can echo back parts of the
   * credentials that were offered.
   */
  async verifyConnection(): Promise<EmailHealth> {
    const base: EmailHealth = {
      status: 'not_configured',
      provider: this.name,
      host: this.config.host || undefined,
      port: this.config.port,
      secure: this.config.secure,
      warnings: this.configurationWarnings(),
    };

    if (!this.isConfigured()) {
      return { ...base, detail: 'SMTP_HOST or SMTP_FROM_EMAIL is not set.' };
    }

    const startedAt = Date.now();
    try {
      await this.transport().verify();
      return {
        ...base,
        status: 'ok',
        latencyMs: Date.now() - startedAt,
        detail: 'Connected and authenticated.',
      };
    } catch (error) {
      const classified = classifyEmailError(error);
      this.logger.error(
        { kind: classified.kind, host: this.config.host, port: this.config.port },
        'SMTP verification failed',
      );
      return {
        ...base,
        status: classified.kind === 'authentication' ? 'unauthenticated' : 'unreachable',
        latencyMs: Date.now() - startedAt,
        detail: classified.summary,
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.transporter?.close();
  }

  private transport(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        // Force STARTTLS on a non-secure port unless explicitly disabled (a
        // plain submission port with no STARTTLS must set SMTP_REQUIRE_TLS=false).
        ...(this.config.secure ? {} : { requireTLS: this.config.requireTls }),
        ...(this.config.authMethod ? { authMethod: this.config.authMethod } : {}),
        // Pooled: a burst of booking confirmations should reuse one connection
        // rather than open one per message and trip a rate limit.
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        connectionTimeout: CONNECTION_TIMEOUT_MS,
        greetingTimeout: GREETING_TIMEOUT_MS,
        socketTimeout: SOCKET_TIMEOUT_MS,
        ...(this.config.user
          ? { auth: { user: this.config.user, pass: this.config.password } }
          : {}),
      });
    }
    return this.transporter;
  }
}
