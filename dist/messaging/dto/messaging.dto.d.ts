import { PaginationQueryDto } from '../../shared/query.dto';
export declare class SendMessageDto {
    body: string;
    attachmentPath?: string;
    attachmentName?: string;
}
export declare class StartConversationDto {
    studentId: string;
    subject?: string;
}
export declare class ListMessagesQueryDto extends PaginationQueryDto {
}
export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    attachmentName: string | null;
    isHidden: boolean;
    createdAt: string;
}
