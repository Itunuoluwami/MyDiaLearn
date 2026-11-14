export interface EmailAddress {
    name?: string;
    address: string;
}
export interface EmailMessage {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    headers?: Record<string, string>;
}
export interface EmailSendResult {
    messageId: string;
    accepted: string[];
    rejected: string[];
    provider: string;
    attempts: number;
}
export type EmailHealthStatus = 'ok' | 'not_configured' | 'unreachable' | 'unauthenticated';
export interface EmailHealth {
    status: EmailHealthStatus;
    provider: string;
    host?: string;
    port?: number;
    secure?: boolean;
    latencyMs?: number;
    detail?: string;
    warnings?: string[];
}
export interface EmailProvider {
    readonly name: string;
    isConfigured(): boolean;
    send(message: EmailMessage): Promise<EmailSendResult>;
    verifyConnection(): Promise<EmailHealth>;
}
export declare const EMAIL_PROVIDER: unique symbol;
