import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';

import { TeachingController } from './teaching.controller';
import { TeachingRepository } from './teaching.repository';
import { TeachingService } from './teaching.service';

/**
 * Lesson notes, assignments and learning resources.
 *
 * Three of the brief's modules in one package, because they share one access
 * shape — a tutor manages their own rows, a family reads what pertains to their
 * learner — enforced by the "Tutors manage" / "Families read" policies. They
 * are separated by DTO and response mapping rather than by module.
 *
 * Replaces the lesson_notes, assignments and learning_resources tables. The
 * assignments_notify trigger continues to notify a family when work is set, so
 * no notification is raised in application code.
 */
@Module({
  imports: [NotificationsModule],
  controllers: [TeachingController],
  providers: [TeachingRepository, TeachingService],
  exports: [TeachingService],
})
export class TeachingModule {}
