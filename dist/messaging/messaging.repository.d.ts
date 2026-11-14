import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export interface ConversationRow {
    id: string;
    subject: string | null;
    booking_id: string | null;
    student_id: string | null;
    created_by: string;
    last_message_at: Date | null;
    created_at: Date;
}
export interface MessageRow {
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    attachment_path: string | null;
    attachment_name: string | null;
    is_hidden: boolean;
    hidden_reason: string | null;
    created_at: Date;
}
export declare class MessagingRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    listConversations(userId: string): Promise<Record<string, unknown>[]>;
    findConversation(userId: string, id: string): Promise<ConversationRow | null>;
    listMessages(userId: string, conversationId: string, query: PaginationQueryDto): Promise<{
        rows: MessageRow[];
        total: number;
    }>;
    messageRecipients(conversationId: string, senderId: string): Promise<{
        email: string;
        sender_name: string | null;
    }[]>;
    sendMessage(userId: string, input: {
        conversationId: string;
        body: string;
        attachmentPath?: string | undefined;
        attachmentName?: string | undefined;
    }): Promise<MessageRow>;
    markRead(userId: string, conversationId: string): Promise<void>;
    startConversation(tutorUserId: string, input: {
        studentId: string;
        subject?: string | undefined;
    }): Promise<string>;
}
