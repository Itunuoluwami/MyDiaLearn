import { Global, Module, type Provider } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { integrationsConfig, type IntegrationsConfig } from '../../config/configuration';
import { PAYMENT_PROVIDER, type PaymentProvider } from './payment.interface';
import { PaymentGatewayService } from './payment.service';
import { SimulatedPaymentProvider } from './providers/simulated-payment.provider';

/**
 * Chooses the payment adapter from PAYMENT_PROVIDER.
 *
 * This is the only file that names a concrete provider. To add one: write an
 * adapter in providers/, add its name to PAYMENT_PROVIDER's allowed values in
 * config/env.validation.ts, and add a case below.
 */
const paymentProvider: Provider = {
  provide: PAYMENT_PROVIDER,
  inject: [integrationsConfig.KEY, PinoLogger],
  useFactory: (config: IntegrationsConfig, logger: PinoLogger): PaymentProvider => {
    switch (config.payment) {
      case 'simulated':
        return new SimulatedPaymentProvider(logger, config.paymentWebhookSecret || undefined);
      default:
        throw new Error(`Unknown PAYMENT_PROVIDER "${String(config.payment)}".`);
    }
  },
};

@Global()
@Module({
  providers: [paymentProvider, PaymentGatewayService],
  exports: [PAYMENT_PROVIDER, PaymentGatewayService],
})
export class PaymentModule {}
