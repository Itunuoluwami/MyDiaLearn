import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import {
  PAYMENT_PROVIDER,
  WebhookSignatureError,
  type InitializePaymentRequest,
  type InitializePaymentResult,
  type Money,
  type PaymentProvider,
  type RefundPaymentRequest,
  type RefundPaymentResult,
  type VerifyPaymentRequest,
  type VerifyPaymentResult,
  type WebhookEvent,
} from './payment.interface';

/** A provider call that failed; the business layer decides what that means. */
export class PaymentProviderError extends Error {
  constructor(
    readonly operation: string,
    readonly provider: string,
    cause: unknown,
  ) {
    super(`Payment provider ${provider} failed during ${operation}.`);
    this.name = 'PaymentProviderError';
    this.cause = cause;
  }
}

/**
 * The application's single entry point to the payment provider.
 *
 * Business code (PaymentsService) depends on this, never on an adapter, so the
 * provider can be replaced by configuration alone. This layer adds what every
 * provider needs and none should reimplement: uniform errors, and logging that
 * records references, amounts and outcomes — never card data, never
 * customer details, never raw provider payloads.
 */
@Injectable()
export class PaymentGatewayService {
  constructor(
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PaymentGatewayService.name);
  }

  get providerName(): string {
    return this.provider.name;
  }

  get capabilities(): PaymentProvider['capabilities'] {
    return this.provider.capabilities;
  }

  initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResult> {
    return this.call(
      'initializePayment',
      { reference: request.reference, ...logMoney(request.money) },
      () => this.provider.initializePayment(request),
    );
  }

  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    return this.call('verifyPayment', { reference: request.reference }, () =>
      this.provider.verifyPayment(request),
    );
  }

  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResult> {
    return this.call(
      'refundPayment',
      { idempotencyKey: request.idempotencyKey, ...logMoney(request.money) },
      () => this.provider.refundPayment(request),
    );
  }

  /**
   * Verifies and parses a webhook addressed to `providerName`. A webhook for a
   * provider other than the configured one is refused: it cannot be verified.
   */
  parseWebhook(
    providerName: string,
    rawBody: Buffer | undefined,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookEvent {
    if (providerName !== this.provider.name || !this.provider.capabilities.webhooks) {
      throw new WebhookSignatureError('No webhook endpoint for this provider.');
    }
    if (!rawBody || rawBody.length === 0)
      throw new WebhookSignatureError('Empty webhook body.');
    try {
      return this.provider.parseWebhook(rawBody, headers);
    } catch (error) {
      this.logger.warn({ provider: providerName }, 'Rejected an unverifiable webhook');
      if (error instanceof WebhookSignatureError) throw error;
      throw new WebhookSignatureError();
    }
  }

  private async call<T>(
    operation: string,
    context: Record<string, unknown>,
    run: () => Promise<T>,
  ): Promise<T> {
    const started = Date.now();
    try {
      const result = await run();
      this.logger.info(
        { provider: this.provider.name, operation, ms: Date.now() - started, ...context },
        'Payment provider call succeeded',
      );
      return result;
    } catch (error) {
      this.logger.error(
        {
          provider: this.provider.name,
          operation,
          ms: Date.now() - started,
          ...context,
          error: error instanceof Error ? error.message : String(error),
        },
        'Payment provider call failed',
      );
      throw new PaymentProviderError(operation, this.provider.name, error);
    }
  }
}

function logMoney(money: Money): Record<string, string> {
  return { amount: money.amount, currency: money.currency };
}

/**
 * Converts an exact decimal string to integer minor units using the
 * currency's exponent, without floating point. For adapters whose provider
 * expects kobo/cents.
 */
export function toMinorUnits(money: Money): bigint {
  const [whole = '0', fraction = ''] = money.amount.trim().split('.');
  if (!/^-?\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > money.decimals) {
    throw new Error(`Invalid ${money.currency} amount: ${money.amount}`);
  }
  const negative = whole.startsWith('-');
  const digits = `${whole.replace('-', '')}${fraction.padEnd(money.decimals, '0')}`;
  const value = BigInt(digits);
  return negative ? -value : value;
}
