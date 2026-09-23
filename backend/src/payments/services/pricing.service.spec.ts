import { Test } from '@nestjs/testing';

import type { AppException } from '../../common/exceptions/app.exception';
import { PrismaService } from '../../database/prisma.service';
import { PlatformSettingsService } from '../../platform-settings/platform-settings.service';
import { PricingService } from './pricing.service';
import { SettlementService } from './settlement.service';

/**
 * The financial rules themselves are not tested here — they live in
 * booking_quote() and are exercised against the database. What is tested is
 * that this layer adds no rules of its own: no duration list, no threshold, no
 * rounding. Migration rule 11 made concrete.
 */
describe('PricingService', () => {
  let service: PricingService;
  let prisma: Record<string, jest.Mock>;
  let settings: Record<string, jest.Mock>;

  const quoteRow = {
    currency: 'NGN',
    hourly_rate: '12500.00',
    duration_minutes: 60,
    lesson_amount: '12500.00',
    platform_fee: '625.00',
    processing_fee: '0.00',
    commission_amount: '1875.00',
    total_amount: '12500.00',
    commission_rule_id: 'c0000000-0000-4000-8000-000000000001',
    cancellation_policy_id: 'p0000000-0000-4000-8000-000000000001',
  };

  beforeEach(async () => {
    prisma = {
      withUser: jest.fn(async (_id: string, fn: (tx: unknown) => Promise<unknown>) =>
        fn({ $queryRaw: () => Promise.resolve([quoteRow]) }),
      ),
    };
    settings = { allowedDurations: jest.fn().mockResolvedValue([30, 60, 90]) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: prisma },
        { provide: PlatformSettingsService, useValue: settings },
      ],
    }).compile();

    service = moduleRef.get(PricingService);
  });

  it('returns the split the database computed, unmodified', async () => {
    const quote = await service.quote('u1', { tutorId: 't1', durationMinutes: 60 });

    expect(quote).toEqual({
      currency: 'NGN',
      hourlyRate: '12500.00',
      durationMinutes: 60,
      lessonAmount: '12500.00',
      platformFee: '625.00',
      processingFee: '0.00',
      commissionAmount: '1875.00',
      totalAmount: '12500.00',
      commissionRuleId: 'c0000000-0000-4000-8000-000000000001',
      cancellationPolicyId: 'p0000000-0000-4000-8000-000000000001',
    });
  });

  it('keeps every amount a string', async () => {
    // NUMERIC through a JavaScript float is how settlement reports stop
    // reconciling. Nothing in this path may become a number.
    const quote = await service.quote('u1', { tutorId: 't1', durationMinutes: 60 });
    for (const key of [
      'hourlyRate',
      'lessonAmount',
      'platformFee',
      'processingFee',
      'commissionAmount',
      'totalAmount',
    ] as const) {
      expect(typeof quote[key]).toBe('string');
    }
  });

  it('takes the allowed durations from configuration, not from code', async () => {
    const error = await service
      .quote('u1', { tutorId: 't1', durationMinutes: 45 })
      .catch((e: AppException) => e);

    // 45 is a plausible lesson length, and is rejected only because this
    // deployment's platform_settings row does not list it.
    expect((error as AppException).getStatus()).toBe(400);
    expect((error as AppException).message).toContain('30, 60, 90');
    expect(settings.allowedDurations).toHaveBeenCalled();
  });

  it('quotes inside the caller context, so tutor visibility rules apply', async () => {
    await service.quote('caller-1', { tutorId: 't1', durationMinutes: 60 });
    expect(prisma.withUser).toHaveBeenCalledWith('caller-1', expect.any(Function));
  });
});

describe('SettlementService', () => {
  let service: SettlementService;
  let settings: Record<string, jest.Mock>;

  beforeEach(async () => {
    settings = {
      payoutMinimum: jest.fn().mockResolvedValue(50),
      baseCurrency: jest.fn().mockResolvedValue('USD'),
      get: jest.fn().mockResolvedValue(null),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SettlementService,
        { provide: PrismaService, useValue: { withUser: jest.fn() } },
        { provide: PlatformSettingsService, useValue: settings },
      ],
    }).compile();

    service = moduleRef.get(SettlementService);
  });

  it('refuses a payout below the configured minimum, naming it', async () => {
    const error = await service.assertPayoutAllowed(20).catch((e: AppException) => e);
    expect((error as AppException).getStatus()).toBe(400);
    expect((error as AppException).message).toContain('50 USD');
  });

  it('allows a payout at the minimum', async () => {
    await expect(service.assertPayoutAllowed(50)).resolves.toBeUndefined();
  });

  it('reads the threshold each time rather than caching a constant', async () => {
    await service.assertPayoutAllowed(100);
    settings.payoutMinimum.mockResolvedValue(200);
    // An admin raising the threshold takes effect on the next request.
    await expect(service.assertPayoutAllowed(100)).rejects.toThrow(/200/);
  });
});
