import { OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { EmailService } from '../../integrations/email/email.service';
import { NotificationsRepository } from '../notifications.repository';
export declare class NotificationDispatchService implements OnModuleInit {
    private readonly repository;
    private readonly email;
    private readonly logger;
    constructor(repository: NotificationsRepository, email: EmailService, logger: PinoLogger);
    onModuleInit(): void;
    dispatchInApp(input: {
        actorId: string;
        userId: string;
        triggerKey: string;
        vars: Record<string, unknown>;
        link?: string;
    }): Promise<void>;
    dispatchEmail(input: {
        to: string;
        triggerKey: string;
        vars: Record<string, unknown>;
    }): Promise<boolean>;
    dispatch(input: {
        actorId: string;
        userId: string;
        email?: string;
        triggerKey: string;
        vars: Record<string, unknown>;
        link?: string;
    }): Promise<{
        inApp: boolean;
        email: boolean;
    }>;
}
