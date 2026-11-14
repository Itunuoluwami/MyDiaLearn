import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { MessageResponse } from './dto/messaging.dto';
import { MessagingRepository, type MessageRow } from './messaging.repository';
export declare class MessagingService {
    private readonly repository;
    private readonly notifications;
    constructor(repository: MessagingRepository, notifications: NotificationDispatchService);
    private emailParticipants;
    listConversations(userId: string): Promise<Record<string, unknown>[]>;
    messages(userId: string, conversationId: string, query: PaginationQueryDto): Promise<Paginated<MessageResponse>>;
    send(userId: string, conversationId: string, input: {
        body: string;
        attachmentPath?: string;
        attachmentName?: string;
    }): Promise<MessageResponse>;
    markRead(userId: string, conversationId: string): Promise<void>;
    startConversation(tutorUserId: string, input: {
        studentId: string;
        subject?: string | undefined;
    }): Promise<{
        id: string;
    }>;
}
export declare function toResponse(row: MessageRow): MessageResponse;
