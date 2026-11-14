import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { NotificationResponse } from './dto/notification.dto';
import { NotificationsRepository, type NotificationRow } from './notifications.repository';
export declare class NotificationsService {
    private readonly repository;
    constructor(repository: NotificationsRepository);
    list(userId: string, query: PaginationQueryDto): Promise<Paginated<NotificationResponse>>;
    unreadCount(userId: string): Promise<number>;
    markRead(userId: string, ids: string[]): Promise<{
        updated: number;
    }>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
}
export declare function toResponse(row: NotificationRow): NotificationResponse;
