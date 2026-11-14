import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
export type VerificationPurpose = 'email_verification' | 'password_reset';
export interface VerificationTokenRow {
    id: string;
    user_id: string;
    purpose: VerificationPurpose;
    expires_at: Date;
    consumed_at: Date | null;
}
export declare class VerificationTokenRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    create(input: {
        userId: string;
        purpose: VerificationPurpose;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    consume(tokenHash: string, purpose: VerificationPurpose): Promise<VerificationTokenRow | null>;
}
