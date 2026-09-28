import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';

/**
 * The admin portal: dashboard, users, tutor verification.
 *
 * Replaces admin_dashboard_summary() and the admin portal's direct reads and
 * writes of profiles, tutors, tutor_verification_progress and
 * tutor_documents. Governance actions (suspension) go through
 * admin_request_action(), unchanged.
 */
@Module({
  controllers: [AdminController],
  providers: [AdminRepository, AdminService],
})
export class AdminModule {}
