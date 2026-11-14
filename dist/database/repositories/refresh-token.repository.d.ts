import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
export interface RefreshTokenRow {
    id: string;
    user_id: string;
    family_id: string;
    expires_at: Date;
    revoked_at: Date | null;
    revoked_reason: string | null;
}
export declare class RefreshTokenRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    create(input: {
        userId: string;
        tokenHash: string;
        familyId: string;
        expiresAt: Date;
        userAgent?: string;
        ip?: string;
    }): Promise<{
        id: string;
    }>;
    findByHash(tokenHash: string): Promise<RefreshTokenRow | null>;
    revoke(id: string, reason: string, replacedBy?: string): Promise<void>;
    revokeFamily(familyId: string, reason: string): Promise<number>;
    revokeAllForUser(userId: string, reason: string): Promise<number>;
    deleteExpired(): Promise<number>;
}
