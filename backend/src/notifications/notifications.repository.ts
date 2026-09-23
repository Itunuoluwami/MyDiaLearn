import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface NotificationRow {
  id: string;
  user_id: string;
  trigger_key: string | null;
  channel: string;
  /** The column is `title`; the template calls the same thing a subject. */
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

@Injectable()
export class NotificationsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * The caller's own notifications.
   *
   * Scoped by user_id in the query AND read inside the caller's claims, so the
   * RLS policy on notifications applies too. Belt and braces is deliberate
   * here: this is the pattern every repository follows, because a query that
   * relies on RLS alone breaks silently the day someone runs it as the owner.
   */
  async listForUser(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: NotificationRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<NotificationRow[]>`
        select id, user_id, trigger_key, channel::text, title, body, link, read_at, created_at
        from public.notifications
        where user_id = ${userId}::uuid
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.notifications where user_id = ${userId}::uuid
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n
        from public.notifications
        where user_id = ${userId}::uuid and read_at is null
      `;
      return Number(rows[0]?.n ?? 0);
    });
  }

  async markRead(userId: string, ids: string[]): Promise<number> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$executeRaw`
        update public.notifications
        set read_at = coalesce(read_at, now())
        where user_id = ${userId}::uuid
          and id = any(${ids}::uuid[])
          and read_at is null
      `,
    );
  }

  async markAllRead(userId: string): Promise<number> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$executeRaw`
        update public.notifications
        set read_at = now()
        where user_id = ${userId}::uuid and read_at is null
      `,
    );
  }

  /**
   * Dispatches through the database's notify_user(), which renders the
   * notification_templates row for the trigger key and inserts the result.
   */
  async notify(
    actorId: string,
    input: {
      userId: string;
      triggerKey: string;
      vars: Record<string, unknown>;
      link?: string;
    },
  ): Promise<void> {
    await this.prisma.withUser(actorId, async (tx) => {
      await tx.$executeRaw`
        select public.notify_user(
          ${input.userId}::uuid,
          ${input.triggerKey},
          ${JSON.stringify(input.vars)}::jsonb,
          ${input.link ?? null}
        )
      `;
    });
  }

  async findTemplates(): Promise<NotificationTemplateRow[]> {
    return this.prisma.$queryRaw<NotificationTemplateRow[]>`
      select id, trigger_key, channel::text, subject, body, is_active
      from public.notification_templates
      order by trigger_key, channel
    `;
  }

  async findTemplate(
    triggerKey: string,
    channel: string,
  ): Promise<NotificationTemplateRow | null> {
    const rows = await this.prisma.$queryRaw<NotificationTemplateRow[]>`
      select id, trigger_key, channel::text, subject, body, is_active
      from public.notification_templates
      where trigger_key = ${triggerKey} and channel::text = ${channel} and is_active
      limit 1
    `;
    return rows[0] ?? null;
  }
}
