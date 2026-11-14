import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { ListNotificationsQueryDto, MarkReadDto, type NotificationResponse, type UnreadCountResponse } from './dto/notification.dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    list(user: AuthenticatedUser, query: ListNotificationsQueryDto): Promise<Paginated<NotificationResponse>>;
    unreadCount(user: AuthenticatedUser): Promise<UnreadCountResponse>;
    markRead(user: AuthenticatedUser, dto: MarkReadDto): Promise<{
        updated: number;
    }>;
    markAllRead(user: AuthenticatedUser): Promise<{
        updated: number;
    }>;
}
