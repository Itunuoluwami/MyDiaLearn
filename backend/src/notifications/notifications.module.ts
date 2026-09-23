import { Module } from '@nestjs/common';

/**
 * In-app notifications and transactional email.
 *
 * Replaces notify_user() and render_template(), and the notifications /
 * notification_templates tables. Triggered today by assignments_notify and
 * messages_notify.
 *
 * The notification_channel enum already allows 'email', but notify_user() only
 * ever writes in-app rows, so email dispatch is new work rather than a port —
 * see question Q4. Delivery goes through EmailService; this module never talks
 * to SMTP directly.
 *
 * Foundation phase: boundary only. No controllers or services yet — migration
 * rule 7 keeps Supabase serving this domain until a verified replacement exists.
 */
@Module({})
export class NotificationsModule {}
