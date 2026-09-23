import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { appConfig, authConfig } from '../../config/configuration';
import type { AppConfig, AuthConfig } from '../../config/configuration';
import { classifyEmailError } from './email.errors';
import {
  EMAIL_PROVIDER,
  type EmailHealth,
  type EmailMessage,
  type EmailProvider,
  type EmailSendResult,
} from './email.interface';
import { maskAddress } from './email.masking';
import { renderLayout, toPlainText } from './templates/email-layout';
import {
  TEMPLATE_FALLBACKS,
  buildLayoutInput,
  isEmailTrigger,
  type EmailTrigger,
  type TemplateDefinition,
} from './templates/email-templates';

/** Looks up an active row in notification_templates. Supplied by the caller. */
export type TemplateLookup = (
  triggerKey: string,
) => Promise<{ subject: string | null; body: string | null } | null>;

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 400;

/**
 * The injectable email facade.
 *
 * This is what business services depend on. They pass a trigger key and a bag
 * of variables; they never build a message, never choose a provider, and never
 * see nodemailer.
 *
 * Responsibilities kept here rather than in the adapter, because they are the
 * same whichever provider is bound: template resolution, retry with backoff,
 * and structured logging that reveals a delivery problem without leaking who
 * was written to or what was said.
 */
@Injectable()
export class EmailService {
  private lookupTemplate: TemplateLookup | null = null;

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly provider: EmailProvider,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    @Inject(authConfig.KEY) private readonly auth: AuthConfig,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(EmailService.name);
  }

  /**
   * Wires database-backed templates in.
   *
   * Injected rather than imported so this module stays free of a database
   * dependency — which is what lets it be unit-tested, and reused, without
   * one. NotificationsModule registers the lookup at startup.
   */
  useTemplateSource(lookup: TemplateLookup): void {
    this.lookupTemplate = lookup;
  }

  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Sends a templated email.
   *
   * Subject and body come from `notification_templates` when an active row
   * exists, so an admin can reword an email without a deploy. The built-in
   * definition is a fallback, and using one is logged — it means the database
   * and the code disagree.
   */
  async sendTemplate(input: {
    trigger: EmailTrigger | string;
    to: string | string[];
    vars?: Record<string, unknown>;
    replyTo?: string;
    headers?: Record<string, string>;
  }): Promise<EmailSendResult | null> {
    if (!isEmailTrigger(input.trigger)) {
      // Refusing an unknown key is deliberate: silently sending something
      // generic would hide a typo until a user reported a blank email.
      this.logger.error({ trigger: input.trigger }, 'Unknown email trigger; nothing sent');
      return null;
    }

    const definition = await this.resolveDefinition(input.trigger);
    const vars = {
      app_url: this.auth.appUrl,
      brand_name: 'DiaLearn',
      ...(input.vars ?? {}),
    };

    const { layout, subject, missing } = buildLayoutInput(definition, vars);
    if (missing.length) {
      // Not fatal — the placeholder stays visible in the output, which is
      // better than a sentence with a hole in it — but it is a bug worth
      // seeing. Names only; values may be personal data.
      this.logger.warn(
        { trigger: input.trigger, missing },
        'Email template variables were not supplied',
      );
    }

    const brand = { name: 'DiaLearn', appUrl: this.auth.appUrl };

    return this.send({
      to: input.to,
      subject,
      html: renderLayout(layout, brand),
      text: toPlainText(layout, brand),
      ...(input.replyTo !== undefined && { replyTo: input.replyTo }),
      headers: {
        // Lets a delivery be traced back to the flow that caused it without
        // putting anything identifying in the header.
        'X-DiaLearn-Trigger': input.trigger,
        ...(input.headers ?? {}),
      },
    });
  }

  /**
   * Sends a message, retrying transient failures.
   *
   * Only failures classified as retryable are retried — a refused mailbox or a
   * rejected password never is, because repeating either wastes time and can
   * get the sending address throttled or blocked.
   *
   * Returns null rather than throwing. Email is a side effect of a user action,
   * not the action itself: a booking must not fail because a confirmation
   * could not be delivered. The failure is logged, and the caller may check the
   * result when it matters.
   */
  async send(message: EmailMessage): Promise<EmailSendResult | null> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    const masked = recipients.map(maskAddress);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const result = await this.provider.send(message);
        this.logger.info(
          {
            provider: result.provider,
            messageId: result.messageId,
            to: masked,
            accepted: result.accepted.length,
            rejected: result.rejected.length,
            attempt,
          },
          'Email sent',
        );
        return { ...result, attempts: attempt };
      } catch (error) {
        const classified = classifyEmailError(error);
        const last = attempt === MAX_ATTEMPTS || !classified.retryable;

        this.logger.error(
          {
            provider: this.provider.name,
            to: masked,
            kind: classified.kind,
            retryable: classified.retryable,
            attempt,
            willRetry: !last,
          },
          // The classified summary only. A raw transport message can echo back
          // part of the credentials that were offered.
          classified.summary,
        );

        if (last) return null;
        // Exponential backoff: 400ms, 800ms. Short enough not to hold a
        // request, long enough for a brief network blip to clear.
        await delay(BASE_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }

    return null;
  }

  /** Connects and authenticates without sending. For the admin health check. */
  async checkHealth(): Promise<EmailHealth> {
    return this.provider.verifyConnection();
  }

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  get environment(): string {
    return this.app.env;
  }

  private async resolveDefinition(trigger: EmailTrigger): Promise<TemplateDefinition> {
    const fallback = TEMPLATE_FALLBACKS[trigger];
    if (!this.lookupTemplate) return fallback;

    try {
      const row = await this.lookupTemplate(trigger);
      if (!row?.subject || !row.body) {
        this.logger.debug(
          { trigger },
          'No active email template row; using the built-in definition',
        );
        return fallback;
      }

      // The database row wins for wording. The layout, action button and
      // footer stay with the code, because they are presentation rather than
      // copy an admin edits.
      return {
        ...fallback,
        subject: row.subject,
        paragraphs: row.body
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean),
      };
    } catch (error) {
      this.logger.error({ err: error, trigger }, 'Template lookup failed; using fallback');
      return fallback;
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
