import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { EmailService } from './email.service';
import { type EmailTrigger } from './templates/email-templates';
import type { EmailHealth } from './email.interface';
export declare class SendTestEmailDto {
    to: string;
    trigger?: EmailTrigger;
}
export declare class EmailAdminController {
    private readonly email;
    constructor(email: EmailService);
    health(): Promise<EmailHealth & {
        environment: string;
    }>;
    triggers(): {
        triggers: readonly string[];
    };
    sendTest(user: AuthenticatedUser, dto: SendTestEmailDto): Promise<{
        sent: boolean;
        provider: string;
        messageId?: string;
        attempts?: number;
    }>;
}
