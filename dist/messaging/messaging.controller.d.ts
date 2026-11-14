import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { ListMessagesQueryDto, SendMessageDto, StartConversationDto, type MessageResponse } from './dto/messaging.dto';
import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private readonly messaging;
    constructor(messaging: MessagingService);
    list(user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    start(user: AuthenticatedUser, dto: StartConversationDto): Promise<{
        id: string;
    }>;
    messages(user: AuthenticatedUser, id: string, query: ListMessagesQueryDto): Promise<Paginated<MessageResponse>>;
    send(user: AuthenticatedUser, id: string, dto: SendMessageDto): Promise<MessageResponse>;
    markRead(user: AuthenticatedUser, id: string): Promise<void>;
}
