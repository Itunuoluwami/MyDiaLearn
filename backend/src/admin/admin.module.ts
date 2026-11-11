import { Module } from '@nestjs/common';

import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import {
  GovernanceController,
  InvitationsController,
} from './governance/governance.controller';
import { GovernanceRepository } from './governance/governance.repository';
import { GovernanceService } from './governance/governance.service';
import { AdminSettingsController } from './settings/admin-settings.controller';
import { AdminSettingsRepository } from './settings/admin-settings.repository';
import { AdminSettingsService } from './settings/admin-settings.service';

/**
 * The admin portal: dashboard, users, verification, bookings, payments,
 * payouts, disputes, moderation, reports, platform settings and governance.
 *
 * Replaces the portal's direct reads and writes of those tables and its calls
 * to the admin_* functions. Every money-moving or access-changing action still
 * goes through admin_request_action() and a second admin; nothing here calls
 * admin_execute_action() or admin_cancel_booking().
 */
@Module({
  imports: [NotificationsModule, PaymentsModule],
  controllers: [
    AdminController,
    AdminSettingsController,
    GovernanceController,
    InvitationsController,
  ],
  providers: [
    AdminRepository,
    AdminService,
    AdminSettingsRepository,
    AdminSettingsService,
    GovernanceRepository,
    GovernanceService,
  ],
})
export class AdminModule {}
