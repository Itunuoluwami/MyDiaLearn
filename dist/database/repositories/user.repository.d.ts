import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
export interface AuthUserRow {
    id: string;
    email: string | null;
    encrypted_password: string | null;
    email_confirmed_at: Date | null;
    failed_login_count: number;
    locked_until: Date | null;
    last_sign_in_at: Date | null;
    password_changed_at: Date | null;
}
export interface CreateUserInput {
    email: string;
    passwordHash: string;
    metadata: Record<string, unknown>;
    emailConfirmed: boolean;
}
export declare class UserRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<AuthUserRow | null>;
    findById(id: string): Promise<AuthUserRow | null>;
    create(input: CreateUserInput): Promise<{
        id: string;
    }>;
    setPassword(userId: string, passwordHash: string): Promise<void>;
    clearMustChangePassword(userId: string): Promise<void>;
    markEmailConfirmed(userId: string): Promise<void>;
    recordSuccessfulLogin(userId: string): Promise<void>;
    recordFailedLogin(userId: string, threshold: number, lockMinutes: number): Promise<number>;
    findAuthorization(userId: string): Promise<{
        roles: string[];
        permissions: string[];
        primaryRole: string | null;
        mustChangePassword: boolean;
        fullName: string | null;
    }>;
}
