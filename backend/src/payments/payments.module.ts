import { Module } from '@nestjs/common';

import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { CommissionService } from './services/commission.service';
import { PricingService } from './services/pricing.service';
import { SettlementService } from './services/settlement.service';

/**
 * Charges, commission, earnings and payouts.
 *
 * PricingService is exported because bookings quote before they are created;
 * CommissionService because the admin module lists the rule set. Neither
 * duplicates the arithmetic — both read what the database already decides.
 */
@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsRepository,
    PaymentsService,
    PricingService,
    CommissionService,
    SettlementService,
  ],
  exports: [PaymentsService, PricingService, CommissionService, SettlementService],
})
export class PaymentsModule {}
