import { PinoLogger } from 'nestjs-pino';
import type { EmailHealth, EmailMessage, EmailProvider, EmailSendResult } from '../email.interface';
export declare class LogEmailProvider implements EmailProvider {
    private readonly logger;
    readonly name = "log";
    constructor(logger: PinoLogger);
    isConfigured(): boolean;
    send(message: EmailMessage): Promise<EmailSendResult>;
    verifyConnection(): Promise<EmailHealth>;
}
