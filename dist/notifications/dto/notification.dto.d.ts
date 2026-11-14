import { PaginationQueryDto } from '../../shared/query.dto';
export declare class ListNotificationsQueryDto extends PaginationQueryDto {
}
export declare class MarkReadDto {
    ids: string[];
}
export interface NotificationResponse {
    id: string;
    triggerKey: string | null;
    channel: string;
    subject: string | null;
    body: string | null;
    link: string | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}
export interface UnreadCountResponse {
    unread: number;
}
