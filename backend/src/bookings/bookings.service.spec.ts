import { Test } from '@nestjs/testing';

import { AuditService } from '../common/audit/audit.service';
import type { AppException } from '../common/exceptions/app.exception';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { BookingsRepository } from './bookings.repository';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { BookingsService, translateBookingError } from './bookings.service';
import type { CreateBookingDto } from './dto/booking.dto';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: Record<string, jest.Mock>;
  let audit: Record<string, jest.Mock>;
  let settings: Record<string, jest.Mock>;
  let notifications: Record<string, jest.Mock>;

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
    };
    audit = { record: jest.fn() };
    notifications = {
      dispatch: jest.fn().mockResolvedValue({ inApp: true, email: false }),
      dispatchInApp: jest.fn().mockResolvedValue(undefined),
      dispatchEmail: jest.fn().mockResolvedValue(true),
    };
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
        { provide: NotificationDispatchService, useValue: notifications },
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

/**
 * Who gets told, and what must never happen because of it.
 *
 * These exist because for a long time nothing was told at all: a tutor was not
 * informed that someone had booked them, and a family was not informed that
 * the lesson was on. The templates were in the database the whole time; only
 * the calls were missing.
 */
describe('BookingsService notifications', () => {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const BOOKING_ID = 'b0000000-0000-4000-8000-000000000001';
  const TUTOR_USER = 'tu000000-0000-4000-8000-000000000001';
  const BOOKER = 'u0000000-0000-4000-8000-000000000001';
  const LEARNER = 'su000000-0000-4000-8000-000000000001';

  const bookingRow = {
    id: BOOKING_ID,
    student_id: 's0000000-0000-4000-8000-000000000001',
    tutor_id: 't0000000-0000-4000-8000-000000000001',
    booked_by: BOOKER,
    subject_id: null,
    education_level_id: null,
    starts_at: new Date(Date.now() + 3 * DAY_MS),
    ends_at: new Date(Date.now() + 3 * DAY_MS + 3_600_000),
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

  const context = { ip: null, userAgent: null } as never;

  function harness(overrides: Record<string, unknown> = {}) {
    const notifications = {
      dispatch: jest.fn().mockResolvedValue({ inApp: true, email: true }),
      dispatchInApp: jest.fn().mockResolvedValue(undefined),
      dispatchEmail: jest.fn().mockResolvedValue(true),
    };
    const repository = {
      createWithQuote: jest.fn().mockResolvedValue(bookingRow),
      respond: jest.fn().mockResolvedValue('confirmed'),
      cancelByFamily: jest.fn().mockResolvedValue('cancelled'),
      findById: jest.fn().mockResolvedValue(bookingRow),
      notificationContext: jest.fn().mockResolvedValue({
        id: BOOKING_ID,
        starts_at: bookingRow.starts_at,
        booking_timezone: 'Africa/Lagos',
        tutor_timezone: 'Africa/Lagos',
        total_amount: '25.00',
        currency: 'USD',
        subject_name: 'Physics',
        tutor_user_id: TUTOR_USER,
        tutor_name: 'Coach Jeje',
        tutor_email: 'tutor@example.com',
        student_name: 'Jam Jok',
        student_user_id: LEARNER,
        student_email: 'learner@example.com',
        booker_user_id: BOOKER,
        booker_name: 'A Parent',
        booker_email: 'parent@example.com',
      }),
      ...overrides,
    };
    const settings = {
      minNoticeHours: jest.fn().mockResolvedValue(1),
      maxAdvanceDays: jest.fn().mockResolvedValue(365),
      allowedDurations: jest.fn().mockResolvedValue([30, 60]),
    };
    const service = new BookingsService(
      repository as never,
      settings as never,
      { record: jest.fn() } as never,
      notifications as never,
    );
    return { service, repository, notifications };
  }

  it('tells the tutor when a lesson is requested', async () => {
    const { service, notifications } = harness();
    await service.create(
      BOOKER,
      {
        studentId: bookingRow.student_id,
        tutorId: bookingRow.tutor_id,
        startsAt: bookingRow.starts_at.toISOString(),
        durationMinutes: 60,
        timezone: 'Africa/Lagos',
      } as never,
      context,
    );

    expect(notifications.dispatchInApp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: TUTOR_USER,
        triggerKey: 'booking.created',
        vars: expect.objectContaining({ student_name: 'Jam Jok', subject: 'Physics' }),
      }),
    );
  });

  it('a notification failure never fails the booking', async () => {
    // The lesson is already in the database by this point. Throwing here
    // would tell the family it did not work when it did.
    const { service, notifications } = harness();
    notifications.dispatchInApp.mockRejectedValue(new Error('smtp exploded'));

    await expect(
      service.create(
        BOOKER,
        {
          studentId: bookingRow.student_id,
          tutorId: bookingRow.tutor_id,
          startsAt: bookingRow.starts_at.toISOString(),
          durationMinutes: 60,
          timezone: 'Africa/Lagos',
        } as never,
        context,
      ),
    ).resolves.toBeDefined();
  });

  it('tells both the booker and the learner when a lesson is confirmed', async () => {
    const { service, notifications } = harness();
    await service.respond(TUTOR_USER, BOOKING_ID, true, context);

    const recipients = notifications.dispatch.mock.calls.map((call) => call[0].userId);
    expect(recipients).toEqual(expect.arrayContaining([BOOKER, LEARNER]));
    expect(notifications.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ triggerKey: 'booking.confirmed' }),
    );
  });

  it('says nothing when accepting leaves the lesson unpaid and pending', async () => {
    // tutor_respond_booking() returns `pending` when no payment has cleared.
    // Announcing "confirmed" then would contradict the pay button still on
    // the learner's screen.
    const { service, notifications } = harness({
      respond: jest.fn().mockResolvedValue('pending'),
    });
    await service.respond(TUTOR_USER, BOOKING_ID, true, context);

    expect(notifications.dispatch).not.toHaveBeenCalled();
  });

  it('says nothing when the tutor declines', async () => {
    const { service, notifications } = harness({
      respond: jest.fn().mockResolvedValue('rejected'),
    });
    await service.respond(TUTOR_USER, BOOKING_ID, false, context);

    expect(notifications.dispatch).not.toHaveBeenCalled();
  });

  it('tells the tutor when the family cancels', async () => {
    const { service, notifications } = harness();
    await service.cancelByFamily(BOOKER, BOOKING_ID, 'Changed our minds', context);

    expect(notifications.dispatchInApp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: TUTOR_USER,
        triggerKey: 'booking.cancelled',
        // Left unrendered this would show a literal {{refund_note}}.
        vars: expect.objectContaining({ refund_note: expect.any(String) }),
      }),
    );
  });

  it('does not notify a booking that has already gone', async () => {
    const { service, notifications } = harness({
      notificationContext: jest.fn().mockResolvedValue(null),
    });
    await service.respond(TUTOR_USER, BOOKING_ID, true, context);

    expect(notifications.dispatch).not.toHaveBeenCalled();
  });
});
