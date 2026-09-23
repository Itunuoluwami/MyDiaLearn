import { Test } from '@nestjs/testing';

import type { AppException } from '../../common/exceptions/app.exception';
import type { AvailabilityWindowDto } from '../dto/tutor.dto';
import { TutorAvailabilityRepository } from '../tutor-availability.repository';
import { TutorAvailabilityService } from './tutor-availability.service';
import { TutorsRepository } from '../tutors.repository';

describe('TutorAvailabilityService', () => {
  let service: TutorAvailabilityService;
  let repository: Record<string, jest.Mock>;

  const window = (overrides: Partial<AvailabilityWindowDto> = {}): AvailabilityWindowDto => ({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
    timezone: 'Africa/Lagos',
    ...overrides,
  });

  beforeEach(async () => {
    repository = {
      list: jest.fn().mockResolvedValue([]),
      listPublic: jest.fn().mockResolvedValue([]),
      replaceAll: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TutorAvailabilityService,
        { provide: TutorAvailabilityRepository, useValue: repository },
        {
          provide: TutorsRepository,
          useValue: { ensureOwn: jest.fn().mockResolvedValue({ id: 't1' }) },
        },
      ],
    }).compile();

    service = moduleRef.get(TutorAvailabilityService);
  });

  it('accepts a window that ends after it starts', async () => {
    await expect(service.replaceOwn('u1', [window()])).resolves.toEqual([]);
    expect(repository.replaceAll).toHaveBeenCalled();
  });

  it('rejects a window that ends before it starts', async () => {
    // Neither the database nor tutor_available_slots() refuses this, so it
    // would silently produce a window that never yields a bookable slot.
    const error = await service
      .replaceOwn('u1', [window({ startTime: '17:00', endTime: '09:00' })])
      .catch((e: AppException) => e);

    expect((error as AppException).getStatus()).toBe(400);
    expect(repository.replaceAll).not.toHaveBeenCalled();
  });

  it('rejects a zero-length window', async () => {
    await expect(
      service.replaceOwn('u1', [window({ startTime: '09:00', endTime: '09:00' })]),
    ).rejects.toThrow(/end after it starts/);
  });

  it('compares HH:MM and HH:MM:SS consistently', async () => {
    // Times are compared as strings, which works only because HH:MM:SS sorts
    // lexicographically — so the two notations have to be normalised first.
    await expect(
      service.replaceOwn('u1', [window({ startTime: '09:00', endTime: '09:00:30' })]),
    ).resolves.toBeDefined();
    await expect(
      service.replaceOwn('u1', [window({ startTime: '09:00:30', endTime: '09:00' })]),
    ).rejects.toThrow();
  });

  it('rejects the whole set if any window is invalid', async () => {
    // Availability is replaced wholesale, so a partially-valid submission must
    // not leave a tutor bookable at times they had just removed.
    await expect(
      service.replaceOwn('u1', [window(), window({ startTime: '18:00', endTime: '08:00' })]),
    ).rejects.toThrow();
    expect(repository.replaceAll).not.toHaveBeenCalled();
  });

  it('reads public availability with no caller', async () => {
    await service.listPublic('t1');
    // Not repository.list: a visitor must see what the anon policy grants,
    // not what a signed-in user would.
    expect(repository.listPublic).toHaveBeenCalledWith('t1');
    expect(repository.list).not.toHaveBeenCalled();
  });
});
