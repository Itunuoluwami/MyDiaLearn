import { Test } from '@nestjs/testing';

import { AuditService } from '../common/audit/audit.service';
import type { AppException } from '../common/exceptions/app.exception';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { BookingsRepository } from './bookings.repository';
import { BookingsService, translateBookingError } from './bookings.service';
import type { CreateBookingDto } from './dto/booking.dto';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: Record<string, jest.Mock>;
  let audit: Record<string, jest.Mock>;
  let settings: Record<string, jest.Mock>;

  const row = {
    id: 'b0000000-0000-4000-8000-000000000001',
    student_id: 's0000000-0000-4000-8000-000000000001',
    tutor_id: 't0000000-0000-4000-8000-000000000001',
    booked_by: 'u0000000-0000-4000-8000-000000000001',
    subject_id: null,
    education_level_id: null,
    starts_at: new Date(Date.now() + 3 * DAY),
    ends_at: new Date(Date.now() + 3 * DAY + HOUR),
    duration_minutes: 60,
    booking_timezone: 'Africa/Lagos',
    hourly_rate: '25.00',
    currency: 'USD',
    total_amount: '25.00',
    status: 'pending',
    student_notes: null,
    tutor_accepted_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: new Date(),
  };

  const dto = (overrides: Partial<CreateBookingDto> = {}): CreateBookingDto => ({
    studentId: row.student_id,
    tutorId: row.tutor_id,
    startsAt: new Date(Date.now() + 3 * DAY).toISOString(),
    durationMinutes: 60,
    timezone: 'Africa/Lagos',
    ...overrides,
  });

  beforeEach(async () => {
    repository = {
      createWithQuote: jest.fn().mockResolvedValue(row),
      list: jest.fn(),
      findById: jest.fn(),
      availableSlots: jest.fn().mockResolvedValue([]),
      respond: jest.fn().mockResolvedValue('confirmed'),
      tutorSchedule: jest.fn(),
      openClass: jest.fn(),
      startClass: jest.fn(),
      endClass: jest.fn(),
      adminCancel: jest.fn(),
    };
    audit = { record: jest.fn() };
    settings = {
      minNoticeHours: jest.fn().mockResolvedValue(12),
      maxAdvanceDays: jest.fn().mockResolvedValue(60),
      allowedDurations: jest.fn().mockResolvedValue([30, 45, 60, 90, 120]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: BookingsRepository, useValue: repository },
        { provide: PlatformSettingsService, useValue: settings },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = moduleRef.get(BookingsService);
  });

  describe('booking window', () => {
    it('accepts a booking inside the configured window', async () => {
      const result = await service.create('u1', dto(), {});
      expect(result.id).toBe(row.id);
      expect(repository.createWithQuote).toHaveBeenCalled();
    });

    it('refuses a lesson inside the minimum notice period', async () => {
      const error = await service
        .create('u1', dto({ startsAt: new Date(Date.now() + 2 * HOUR).toISOString() }), {})
        .catch((e: AppException) => e);

      expect((error as AppException).getStatus()).toBe(400);
      expect((error as AppException).message).toContain('12 hours');
      expect(repository.createWithQuote).not.toHaveBeenCalled();
    });

    it('refuses a lesson beyond the booking horizon', async () => {
      const error = await service
        .create('u1', dto({ startsAt: new Date(Date.now() + 90 * DAY).toISOString() }), {})
        .catch((e: AppException) => e);

      expect((error as AppException).message).toContain('60 days');
    });

    it('refuses a duration the admin has not allowed', async () => {
      const error = await service
        .create('u1', dto({ durationMinutes: 37 }), {})
        .catch((e: AppException) => e);

      expect((error as AppException).message).toContain('30, 45, 60, 90, 120');
    });

    it('reads the window from settings rather than assuming it', async () => {
      // The whole point of these being platform_settings rows: an admin
      // widening the notice period must change behaviour without a deploy.
      settings.minNoticeHours.mockResolvedValue(1);
      await expect(
        service.create(
          'u1',
          dto({ startsAt: new Date(Date.now() + 2 * HOUR).toISOString() }),
          {},
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('auditing', () => {
    it('records creation with amounts and identifiers', async () => {
      await service.create('u1', dto(), { ip: '203.0.113.1' });

      expect(audit.record).toHaveBeenCalledWith(
        'booking.created',
        expect.objectContaining({
          actorId: 'u1',
          entityId: row.id,
          metadata: expect.objectContaining({ totalAmount: '25.00', currency: 'USD' }),
        }),
      );
    });

    it('distinguishes acceptance from decline', async () => {
      await service.respond('t1', row.id, true, {});
      expect(audit.record).toHaveBeenCalledWith('booking.accepted', expect.anything());

      audit.record.mockClear();
      await service.respond('t1', row.id, false, {});
      expect(audit.record).toHaveBeenCalledWith('booking.declined', expect.anything());
    });
  });

  describe('response shape', () => {
    it('keeps money as strings', async () => {
      const result = await service.create('u1', dto(), {});
      // NUMERIC values must not be rounded through a JavaScript float.
      expect(typeof result.totalAmount).toBe('string');
      expect(typeof result.hourlyRate).toBe('string');
    });

    it('returns timestamps as ISO strings and keeps the booking timezone', async () => {
      const result = await service.create('u1', dto(), {});
      expect(result.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.timezone).toBe('Africa/Lagos');
    });
  });
});

describe('translateBookingError', () => {
  it('turns an overlap constraint into a conflict the user can act on', () => {
    // The single most likely failure when booking. Without this the frontend
    // shows "An unexpected error occurred" for "that slot was just taken".
    const error = translateBookingError(
      new Error(
        'conflicting key value violates exclusion constraint "bookings_no_tutor_overlap"',
      ),
    );
    expect(error.getStatus()).toBe(409);
    expect(error.message).toContain('no longer available');
  });

  it('maps the database exceptions the PL/pgSQL functions raise', () => {
    expect(translateBookingError(new Error('NOT_AUTHORIZED')).getStatus()).toBe(403);
    expect(translateBookingError(new Error('BOOKING_NOT_FOUND')).getStatus()).toBe(404);
    expect(translateBookingError(new Error('CLASS_NOT_READY')).getStatus()).toBe(409);
    expect(translateBookingError(new Error('ALREADY_PAID')).getStatus()).toBe(409);
    expect(translateBookingError(new Error('NOT_A_TUTOR')).getStatus()).toBe(403);
  });

  it('does not leak an unrecognised database error to the caller', () => {
    const error = translateBookingError(
      new Error('duplicate key value violates unique constraint "some_internal_idx"'),
    );
    expect(error.getStatus()).toBe(500);
    expect(error.message).not.toContain('some_internal_idx');
  });
});
