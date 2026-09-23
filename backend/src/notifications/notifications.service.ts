import { Injectable } from '@nestjs/common';

import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { NotificationResponse } from './dto/notification.dto';
import { NotificationsRepository, type NotificationRow } from './notifications.repository';

/**
 * The caller's notification inbox.
 *
 * Every method takes the acting user explicitly rather than reading it from a
 * request — which is what keeps this testable without HTTP.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  async list(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<Paginated<NotificationResponse>> {
    const { rows, total } = await this.repository.listForUser(userId, query);
    return paginate(rows.map(toResponse), total, query);
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  async markRead(userId: string, ids: string[]): Promise<{ updated: number }> {
    if (!ids.length) return { updated: 0 };
    return { updated: await this.repository.markRead(userId, ids) };
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    return { updated: await this.repository.markAllRead(userId) };
  }
}

/** Row to response. The mapping is the boundary that stops columns leaking. */
export function toResponse(row: NotificationRow): NotificationResponse {
  return {
    id: row.id,
    triggerKey: row.trigger_key,
    channel: row.channel,
    subject: row.title,
    body: row.body,
    link: row.link,
    read: row.read_at !== null,
    readAt: row.read_at ? row.read_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}
