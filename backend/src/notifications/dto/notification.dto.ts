import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../../shared/query.dto';

export class ListNotificationsQueryDto extends PaginationQueryDto {}

export class MarkReadDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  ids!: string[];
}

/**
 * Response shape.
 *
 * `user_id` is deliberately absent: the caller can only ever read their own
 * notifications, so echoing the id adds nothing and starts a habit of passing
 * internal identifiers outward.
 */
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
