import { Module } from '@nestjs/common';

import { StudentsModule } from '../students/students.module';
import { ParentsController } from './parents.controller';
import { ParentsRepository } from './parents.repository';
import { ParentsService } from './parents.service';

/**
 * The parent portal: dashboard, children and their progress.
 *
 * Replaces parent_dashboard_summary() and parent_child_progress(). Imports
 * StudentsModule rather than re-querying students, so the parent-child
 * relationship has one definition.
 */
@Module({
  imports: [StudentsModule],
  controllers: [ParentsController],
  providers: [ParentsRepository, ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
