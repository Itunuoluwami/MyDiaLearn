import { PinoLogger } from 'nestjs-pino';
import type { AppConfig, AuthConfig } from '../../config/configuration';
import { type EmailHealth, type EmailMessage, type EmailProvider, type EmailSendResult } from './email.interface';
import { type EmailTrigger } from './templates/email-templates';
export type TemplateLookup = (triggerKey: string) => Promise<{
    subject: string | null;
    body: string | null;
} | null>;
export declare class EmailService {
    private readonly provider;
    private readonly app;
    private readonly auth;
    private readonly logger;
    private lookupTemplate;
    constructor(provider: EmailProvider, app: AppConfig, auth: AuthConfig, logger: PinoLogger);
    useTemplateSource(lookup: TemplateLookup): void;
    get providerName(): string;
    sendTemplate(input: {
        trigger: EmailTrigger | string;
        to: string | string[];
        vars?: Record<string, unknown>;
        replyTo?: string;
        headers?: Record<string, string>;
    }): Promise<EmailSendResult | null>;
    send(message: EmailMessage): Promise<EmailSendResult | null>;
    checkHealth(): Promise<EmailHealth>;
    isConfigured(): boolean;
    get environment(): string;
    private resolveDefinition;
}
