/**
 * Outbound email port.
 *
 * Business services depend on this interface and on EMAIL_PROVIDER — never on
 * nodemailer, and never on a concrete provider class. Swapping SMTP for an API
 * provider later is a new adapter and one line in EmailModule.
 */

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  /** At least one of text/html is required. Both is preferred. */
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  /** Correlates a delivery with the request that caused it. */
  headers?: Record<string, string>;
}

export interface EmailSendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  /** Which adapter handled it — `smtp` or `log`. */
  provider: string;
  /** 1 when it succeeded first time. Higher means a transient failure. */
  attempts: number;
}

export type EmailHealthStatus = 'ok' | 'not_configured' | 'unreachable' | 'unauthenticated';

export interface EmailHealth {
  status: EmailHealthStatus;
  provider: string;
  /** Host and port only. Never credentials. */
  host?: string;
  port?: number;
  secure?: boolean;
  latencyMs?: number;
  /** Safe, human-readable summary. Never the raw provider message. */
  detail?: string;
  /** Misconfigurations detected without contacting the server. */
  warnings?: string[];
}

export interface EmailProvider {
  readonly name: string;
  /** Whether the adapter has enough configuration to attempt delivery. */
  isConfigured(): boolean;
  send(message: EmailMessage): Promise<EmailSendResult>;
  /** Opens a connection and authenticates, without sending anything. */
  verifyConnection(): Promise<EmailHealth>;
}

/** DI token. Inject this, never a provider class. */
export const EMAIL_PROVIDER = Symbol('EmailProvider');
