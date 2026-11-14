import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
export interface ProfileRecord {
    id: string;
    email: string | null;
    fullName: string | null;
    primaryRole: string;
    isActive: boolean;
    mustChangePassword: boolean;
}
export declare class ProfileRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(id: string): Promise<ProfileRecord | null>;
    findByEmail(email: string): Promise<ProfileRecord | null>;
    findRoles(userId: string): Promise<string[]>;
}
