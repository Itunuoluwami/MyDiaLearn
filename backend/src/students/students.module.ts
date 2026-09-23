import { Module } from '@nestjs/common';

import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

/**
 * Learners, including parent-managed children with no login of their own.
 *
 * Replaces the students table reads and parent_child_progress(). Visibility is
 * can_access_student()'s decision, reached through the students_read policy.
 */
@Module({
  controllers: [StudentsController],
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
