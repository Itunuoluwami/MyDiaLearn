import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export interface NotificationRow {
    id: string;
    user_id: string;
    trigger_key: string | null;
    channel: string;
    title: string | null;
    body: string | null;
    link: string | null;
    read_at: Date | null;
    created_at: Date;
}
export interface NotificationTemplateRow {
    id: string;
    trigger_key: string;
    channel: string;
    subject: string | null;
    body: string | null;
    is_active: boolean;
}
export declare class NotificationsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    listForUser(userId: string, query: PaginationQueryDto): Promise<{
        rows: NotificationRow[];
        total: number;
    }>;
    countUnread(userId: string): Promise<number>;
    markRead(userId: string, ids: string[]): Promise<number>;
    markAllRead(userId: string): Promise<number>;
    notify(actorId: string, input: {
        userId: string;
        triggerKey: string;
        vars: Record<string, unknown>;
        link?: string;
    }): Promise<void>;
    findTemplates(): Promise<NotificationTemplateRow[]>;
    findTemplate(triggerKey: string, channel: string): Promise<NotificationTemplateRow | null>;
}
