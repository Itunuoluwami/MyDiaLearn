import { OnModuleDestroy } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { type SmtpConfig } from '../../../config/configuration';
import type { EmailHealth, EmailMessage, EmailProvider, EmailSendResult } from '../email.interface';
export declare class SmtpEmailProvider implements EmailProvider, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    readonly name = "smtp";
    private transporter?;
    constructor(config: SmtpConfig, logger: PinoLogger);
    isConfigured(): boolean;
    configurationWarnings(): string[];
    send(message: EmailMessage): Promise<EmailSendResult>;
    verifyConnection(): Promise<EmailHealth>;
    onModuleDestroy(): Promise<void>;
    private transport;
}
