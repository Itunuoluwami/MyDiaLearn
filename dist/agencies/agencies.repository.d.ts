import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
type Row = Record<string, unknown>;
export interface AgencyRow {
    id: string;
    owner_id: string;
    name: string;
    registration_number: string | null;
    country_code: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    website: string | null;
    about: string | null;
    logo_url: string | null;
    verification_status: string;
    is_active: boolean;
    revenue_share_percentage: string;
    submitted_at: Date | null;
    created_at: Date;
}
export declare class AgenciesRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findOrCreateOwn(ownerId: string): Promise<AgencyRow | null>;
    update(ownerId: string, patch: Partial<{
        name: string;
        registrationNumber: string | null;
        countryCode: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        website: string | null;
        about: string | null;
    }>): Promise<AgencyRow | null>;
    verificationSteps(ownerId: string, agencyId: string): Promise<Row[]>;
    submitVerification(ownerId: string): Promise<string>;
    dashboard(ownerId: string, agencyId: string): Promise<Row>;
    roster(ownerId: string): Promise<Row[]>;
    ownedTutorProfile(ownerId: string, tutorId: string): Promise<string | null>;
    attachTutor(ownerId: string, tutorId: string): Promise<void>;
    detachTutor(ownerId: string, tutorId: string): Promise<boolean>;
    ensureTutorRecord(tutorProfileId: string): Promise<string>;
    bookings(ownerId: string, filters: {
        status: string | null;
        from: Date | null;
        to: Date | null;
    }): Promise<Row[]>;
    earnings(ownerId: string): Promise<Row | null>;
    payouts(ownerId: string): Promise<Row[]>;
    requestPayout(ownerId: string, amount: number): Promise<string>;
}
export {};
