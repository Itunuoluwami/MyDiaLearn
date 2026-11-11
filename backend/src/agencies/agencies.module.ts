import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';
import { TutorsModule } from '../tutors/tutors.module';
import { AgenciesController } from './agencies.controller';
import { AgenciesRepository } from './agencies.repository';
import { AgenciesService } from './agencies.service';

/**
 * Tutor agencies.
 *
 * An agency account is verified by DiaLearn, adds tutors under it (creating
 * their accounts), manages their profiles, subjects, availability and
 * verification, sees every booking across its tutors, and receives its
 * agreed share of their earnings with its own payouts.
 *
 * The rules live in the database (prisma/sql/130_agencies.sql): the agency
 * rules trigger, the tutor listing gate, the payment split in
 * pay_for_booking() and the agency_* functions. Admin review of agencies is
 * in the admin module.
 */
@Module({
  imports: [AuthModule, TutorsModule, FilesModule],
  controllers: [AgenciesController],
  providers: [AgenciesRepository, AgenciesService],
})
export class AgenciesModule {}
