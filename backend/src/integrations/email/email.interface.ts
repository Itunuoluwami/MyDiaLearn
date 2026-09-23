/**
 * Outbound email port.
 *
 * DiaLearn sends no transactional email today. Supabase Auth sends signup
 * verification, password reset and invitations from its own templates, and
 * notify_user() writes in-app rows only — the notification_channel enum has an
 * 'email' member that nothing ever uses. So this port is defined from the
 * requirement, not reverse-engineered from an incumbent provider, and the SMTP
 * adapter behind it is the first real implementation.
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  /** Plain-text body. At least one of text/html is required. */
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailSendResult {
  /** Provider-assigned id, where the provider supplies one. */
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export interface EmailService {
  send(message: EmailMessage): Promise<EmailSendResult>;
  /** Whether the adapter is configured well enough to deliver mail. */
  isReady(): boolean;
}

/** DI token. Inject the interface, never a concrete adapter. */
export const EMAIL_SERVICE = Symbol('EmailService');
