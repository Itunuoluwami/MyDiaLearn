import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
export interface PlatformSettingRow {
    key: string;
    value: unknown;
    label: string | null;
    description: string | null;
    group_name: string | null;
    is_public: boolean;
}
export declare class PlatformSettingsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findAll(): Promise<PlatformSettingRow[]>;
    findPublic(): Promise<PlatformSettingRow[]>;
    update(actorId: string, key: string, value: unknown): Promise<PlatformSettingRow | null>;
}
