import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PinoLogger } from 'nestjs-pino';

import type {
  ChargeRequest,
  ChargeResult,
  PaymentProvider,
  RefundRequest,
  RefundResult,
} from './payment.interface';

/**
 * Reproduces today's behaviour: an instant successful charge, no gateway.
 *
 * This is not a placeholder to be deleted — it is the faithful adapter for how
 * DiaLearn actually works right now, and keeping it means the payment domain
 * can migrate to NestJS without simultaneously introducing a live gateway.
 * Swapping it for a real provider becomes a separate, independently reversible
 * change, which is the whole point of the port.
 *
 * It must never be selected in production. AppModule refuses that combination.
 */
@Injectable()
export class SimulatedPaymentProvider implements PaymentProvider {
  readonly name = 'simulated';

  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(SimulatedPaymentProvider.name);
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    this.logger.warn(
      {
        bookingId: request.bookingId,
        amountMinor: request.amountMinor,
        currency: request.currency,
      },
      'Simulated charge — no money moved',
    );
    return { status: 'paid', reference: `sim_${randomUUID()}` };
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    this.logger.warn({ reference: request.reference }, 'Simulated refund — no money moved');
    return { status: 'refunded', reference: request.reference };
  }

  verifyWebhook(): boolean {
    // No gateway means no webhooks. Returning false rather than true keeps the
    // fail-closed default if a webhook route is ever pointed at this adapter.
    return false;
  }
}
