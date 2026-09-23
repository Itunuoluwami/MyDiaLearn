import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { EmailService } from '../../integrations/email/email.service';
import { NotificationsRepository } from '../notifications.repository';

/**
 * Raises a notification for a trigger key.
 *
 * **No service anywhere composes notification copy.** Callers pass a trigger
 * key and a variables bag; subject and body come from `notification_templates`.
 * That is what lets an admin reword a notification without a deploy, and it is
 * why `dispatch` takes a key rather than a message.
 *
 * In-app delivery goes through the database's notify_user(), preserving the
 * existing path. Email goes through EmailService, so this module never touches
 * SMTP and never renders a message itself.
 */
@Injectable()
export class NotificationDispatchService implements OnModuleInit {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly email: EmailService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationDispatchService.name);
  }

  /**
   * Gives EmailService its template source.
   *
   * Wired here rather than imported there, so the email module carries no
   * database dependency and stays unit-testable without one.
   */
  onModuleInit(): void {
    this.email.useTemplateSource(async (triggerKey) => {
      const row = await this.repository.findTemplate(triggerKey, 'email');
      return row ? { subject: row.subject, body: row.body } : null;
    });
  }

  /** In-app notification, rendered from the template for `triggerKey`. */
  async dispatchInApp(input: {
    actorId: string;
    userId: string;
    triggerKey: string;
    vars: Record<string, unknown>;
    link?: string;
  }): Promise<void> {
    await this.repository.notify(input.actorId, {
      userId: input.userId,
      triggerKey: input.triggerKey,
      vars: input.vars,
      ...(input.link !== undefined && { link: input.link }),
    });
  }

  /**
   * Email for the same trigger key, when an active email template exists.
   *
   * Which events also send email is an admin decision expressed by the
   * presence of a template, not something a service should assume — so a
   * missing template is a no-op rather than a failure.
   */
  async dispatchEmail(input: {
    to: string;
    triggerKey: string;
    vars: Record<string, unknown>;
  }): Promise<boolean> {
    const template = await this.repository.findTemplate(input.triggerKey, 'email');
    if (!template) {
      this.logger.debug(
        { triggerKey: input.triggerKey },
        'No active email template; nothing sent',
      );
      return false;
    }

    const result = await this.email.sendTemplate({
      trigger: input.triggerKey,
      to: input.to,
      vars: input.vars,
    });
    return result !== null;
  }

  /** Both channels for one event. Each is independent of the other's outcome. */
  async dispatch(input: {
    actorId: string;
    userId: string;
    email?: string;
    triggerKey: string;
    vars: Record<string, unknown>;
    link?: string;
  }): Promise<{ inApp: boolean; email: boolean }> {
    let inApp = false;
    try {
      await this.dispatchInApp(input);
      inApp = true;
    } catch (error) {
      // A failed notification must not fail the booking that caused it.
      this.logger.error(
        { err: error, triggerKey: input.triggerKey },
        'In-app dispatch failed',
      );
    }

    const email = input.email
      ? await this.dispatchEmail({
          to: input.email,
          triggerKey: input.triggerKey,
          vars: input.vars,
        })
      : false;

    return { inApp, email };
  }
}
