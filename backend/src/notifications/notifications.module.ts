import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';

/**
 * In-app notifications and template-driven dispatch.
 *
 * NotificationDispatchService is exported because other domains raise
 * notifications — a booking accepted, an assignment set. They pass a trigger
 * key, never a message.
 */
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService, NotificationDispatchService],
  exports: [NotificationDispatchService, NotificationsService],
})
export class NotificationsModule {}
