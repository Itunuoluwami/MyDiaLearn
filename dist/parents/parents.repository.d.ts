import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
export declare class ParentsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    dashboardSummary(userId: string): Promise<Record<string, unknown> | null>;
    childProgress(userId: string, studentId: string): Promise<Record<string, unknown>[]>;
}
