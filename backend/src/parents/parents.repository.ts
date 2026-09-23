import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';

/**
 * The parent portal's aggregates.
 *
 * Both functions resolve the parent from auth.uid() and apply
 * can_access_student() internally, so there is no parent id to pass and no way
 * to ask about someone else's family.
 */
@Injectable()
export class ParentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async dashboardSummary(userId: string): Promise<Record<string, unknown> | null> {
    const rows = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<
          Record<string, unknown>[]
        >`select * from public.parent_dashboard_summary()`,
    );
    return rows[0] ?? null;
  }

  async childProgress(userId: string, studentId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.parent_child_progress(${studentId}::uuid)
      `,
    );
  }
}
