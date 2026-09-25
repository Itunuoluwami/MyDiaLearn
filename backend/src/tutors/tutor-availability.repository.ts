import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

export interface AvailabilityWindowRow {
  id: string;
  tutor_id: string;
  /** 0 = Sunday, matching PostgreSQL's extract(dow). */
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

export interface AvailabilityWindowInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive?: boolean | undefined;
}

/**
 * Recurring weekly availability.
 *
 * Windows are stored as a day-of-week plus local start/end times **and the zone
 * they were expressed in**. That matters: a tutor in Lagos who is free at 18:00
 * stays free at 18:00 Lagos time through a DST change elsewhere, and
 * tutor_available_slots() resolves windows into concrete instants using the
 * stored zone rather than the server's.
 */
@Injectable()
export class TutorAvailabilityRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * A tutor's published availability, read with no caller.
   *
   * The availability_anon_read policy already allows this, and the booking
   * screen shows it before sign-in. Running it `asAnonymous` means a visitor
   * sees exactly what the policy grants anon — not what a signed-in user would.
   */
  async listPublic(tutorId: string): Promise<AvailabilityWindowRow[]> {
    return this.prisma.asAnonymous(
      async (tx) =>
        tx.$queryRaw<AvailabilityWindowRow[]>`
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid and is_active
        order by day_of_week, start_time
      `,
    );
  }

  async list(userId: string, tutorId: string): Promise<AvailabilityWindowRow[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<AvailabilityWindowRow[]>`
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid
        order by day_of_week, start_time
      `,
    );
  }

  async addAvailabilityWindow(
    userId: string,
    tutorId: string,
    input: { dayOfWeek: number; startTime: string; endTime: string; timezone: string },
  ): Promise<AvailabilityWindowRow> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<AvailabilityWindowRow[]>`
        insert into public.availability_windows (tutor_id, day_of_week, start_time, end_time, timezone)
        values (${tutorId}::uuid, ${input.dayOfWeek}, ${input.startTime}::time,
                ${input.endTime}::time, ${input.timezone})
        returning id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
      `;
      return rows[0]!;
    });
  }

  async updateAvailabilityWindow(
    userId: string,
    id: string,
    isActive: boolean,
  ): Promise<boolean> {
    const n = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$executeRaw`
        update public.availability_windows set is_active = ${isActive}, updated_at = now()
        where id = ${id}::uuid
      `,
    );
    return n > 0;
  }

  async deleteAvailabilityWindow(userId: string, id: string): Promise<boolean> {
    const n = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$executeRaw`delete from public.availability_windows where id = ${id}::uuid`,
    );
    return n > 0;
  }

  /**
   * Replaces the whole week atomically.
   *
   * The availability editor submits the full schedule, and applying it as
   * individual writes would leave a tutor bookable at times they had just
   * removed if one insert failed partway.
   */
  async replaceAll(
    userId: string,
    tutorId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<AvailabilityWindowRow[]> {
    return this.prisma.withUser(userId, async (tx) => {
      await tx.$executeRaw`
        delete from public.availability_windows where tutor_id = ${tutorId}::uuid
      `;

      for (const window of windows) {
        await tx.$executeRaw`
          insert into public.availability_windows
            (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
          values (
            ${tutorId}::uuid, ${window.dayOfWeek},
            ${window.startTime}::time, ${window.endTime}::time,
            ${window.timezone}, ${window.isActive ?? true}
          )
        `;
      }

      return tx.$queryRaw<AvailabilityWindowRow[]>`
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid
        order by day_of_week, start_time
      `;
    });
  }
}
