import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';

import { MessagingController } from './messaging.controller';
import { MessagingRepository } from './messaging.repository';
import { MessagingService } from './messaging.service';

/**
 * Conversations and messages between families and tutors.
 *
 * Replaces my_conversations() and tutor_start_conversation(), and the
 * conversations / conversation_participants / messages tables. Access is
 * membership, enforced by in_conversation() through the table policies.
 */
@Module({
  imports: [NotificationsModule],
  controllers: [MessagingController],
  providers: [MessagingRepository, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
