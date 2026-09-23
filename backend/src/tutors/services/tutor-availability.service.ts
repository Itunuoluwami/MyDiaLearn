import { Injectable } from '@nestjs/common';

import { AppException, ErrorCode } from '../../common/exceptions/app.exception';
import type { AvailabilityWindowDto, AvailabilityWindowResponse } from '../dto/tutor.dto';
import {
  TutorAvailabilityRepository,
  type AvailabilityWindowRow,
} from '../tutor-availability.repository';
import { TutorsRepository } from '../tutors.repository';

/**
 * Recurring weekly availability.
 *
 * The only rule enforced here is that a window ends after it starts — the one
 * thing neither the database nor tutor_available_slots() rejects, and which
 * would silently produce a window that never yields a bookable slot. Everything
 * else about turning windows into offerable times belongs to
 * tutor_available_slots().
 */
@Injectable()
export class TutorAvailabilityService {
  constructor(
    private readonly repository: TutorAvailabilityRepository,
    private readonly tutors: TutorsRepository,
  ) {}

  async listOwn(userId: string): Promise<AvailabilityWindowResponse[]> {
    const tutor = await this.tutors.ensureOwn(userId);
    const rows = await this.repository.list(userId, tutor.id);
    return rows.map(toResponse);
  }

  /** A tutor's published availability, for the pre-sign-in booking screen. */
  async listPublic(tutorId: string): Promise<AvailabilityWindowResponse[]> {
    const rows = await this.repository.listPublic(tutorId);
    return rows.map(toResponse);
  }

  async replaceOwn(
    userId: string,
    windows: AvailabilityWindowDto[],
  ): Promise<AvailabilityWindowResponse[]> {
    for (const window of windows) {
      assertOrdered(window);
    }

    const tutor = await this.tutors.ensureOwn(userId);
    const rows = await this.repository.replaceAll(userId, tutor.id, windows);
    return rows.map(toResponse);
  }
}

/**
 * Rejects a window that ends at or before it starts.
 *
 * Compared as strings deliberately: HH:MM:SS is lexicographically ordered, so
 * this needs no date arithmetic and no zone. An overnight window would have to
 * be expressed as two windows, which is what the existing editor already does.
 */
function assertOrdered(window: AvailabilityWindowDto): void {
  const start = normalise(window.startTime);
  const end = normalise(window.endTime);
  if (end <= start) {
    throw new AppException(
      ErrorCode.VALIDATION_FAILED,
      `Availability must end after it starts (${window.startTime}–${window.endTime}).`,
      400,
      { dayOfWeek: window.dayOfWeek },
    );
  }
}

function normalise(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

export function toResponse(row: AvailabilityWindowRow): AvailabilityWindowResponse {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    isActive: row.is_active,
  };
}
