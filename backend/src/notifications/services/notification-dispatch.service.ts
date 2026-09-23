import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { EMAIL_SERVICE, type EmailService } from '../../integrations/email/email.interface';
import { NotificationsRepository } from '../notifications.repository';

/**
 * Sends a notification for a trigger key.
 *
 * **No service anywhere composes notification copy.** Subject and body come
 * from notification_templates, rendered by the database's render_template()
 * against the variables passed in. That is what lets an admin change wording
 * without a deploy, and it is why `dispatch` takes a trigger key and a
 * variables bag rather than a message.
 *
 * In-app delivery goes through notify_user(), preserving the existing path.
 * Email delivery is new — notification_channel has always allowed 'email' but
 * notify_user() only ever wrote in-app rows — and goes through EmailService,
 * so this module never touches SMTP.
 */
@Injectable()
export class NotificationDispatchService {
  constructor(
    private readonly repository: NotificationsRepository,
    @Inject(EMAIL_SERVICE) private readonly email: EmailService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationDispatchService.name);
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
   * Email for the same trigger key, if a template exists for the channel.
   *
   * Silently does nothing when no active email template is configured. That is
   * the correct behaviour rather than an omission: which events also send
   * email is an admin decision expressed by the presence of a template, not
   * something a service should assume.
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

    await this.email.send({
      to: input.to,
      subject: render(template.subject ?? '', input.vars),
      text: render(template.body ?? '', input.vars),
    });
    return true;
  }
}

/**
 * Mirrors the database's render_template(): `{{ key }}` substitution.
 *
 * Reimplemented here only because the email path renders outside a database
 * call. Unknown placeholders are left intact rather than blanked, so a missing
 * variable is visible in the output instead of producing a sentence with a
 * hole in it.
 */
function render(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? match : String(value);
  });
}
