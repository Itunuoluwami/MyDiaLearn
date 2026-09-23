import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import {
  ListNotificationsQueryDto,
  MarkReadDto,
  type NotificationResponse,
  type UnreadCountResponse,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

/** HTTP only: validate, delegate, return. No business logic, no queries. */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<Paginated<NotificationResponse>> {
    return this.notifications.list(user.id, query);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthenticatedUser): Promise<UnreadCountResponse> {
    return { unread: await this.notifications.unreadCount(user.id) };
  }

  @Post('read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MarkReadDto,
  ): Promise<{ updated: number }> {
    return this.notifications.markRead(user.id, dto.ids);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<{ updated: number }> {
    return this.notifications.markAllRead(user.id);
  }
}
