import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';
type Row = Record<string, unknown>;
export declare class AdminSettingsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    subjects(adminId: string): Promise<Row[]>;
    createSubject(adminId: string, input: {
        name: string;
        slug: string;
        category: string | null;
        sortOrder: number;
    }): Promise<void>;
    setSubjectActive(adminId: string, id: string, isActive: boolean): Promise<boolean>;
    deleteSubject(adminId: string, id: string): Promise<boolean>;
    curricula(adminId: string): Promise<Row[]>;
    createCurriculum(adminId: string, input: {
        name: string;
        code: string;
        countryCode: string | null;
        sortOrder: number;
    }): Promise<void>;
    setCurriculumActive(adminId: string, id: string, isActive: boolean): Promise<boolean>;
    commissionRules(adminId: string): Promise<Row[]>;
    commissionTargets(adminId: string): Promise<{
        tutors: Row[];
        agencies: Row[];
    }>;
    createCommissionRule(adminId: string, input: {
        name: string;
        model: string;
        percentage: number | null;
        fixedAmount: number | null;
        platformFeePercentage: number;
        appliesTo: string;
        tutorId: string | null;
        agencyId: string | null;
        tiers: unknown[];
        priority: number;
    }): Promise<string>;
    setCommissionRuleActive(adminId: string, id: string, isActive: boolean): Promise<boolean>;
    platformSettings(adminId: string, scope: 'payments' | 'general'): Promise<Row[]>;
    upsertSettings(adminId: string, settings: {
        key: string;
        value: unknown;
        label: string | null;
        description: string | null;
        groupName: string | null;
    }[]): Promise<void>;
    updateSettingValue(adminId: string, key: string, value: unknown): Promise<boolean>;
    templates(adminId: string): Promise<Row[]>;
    createTemplate(adminId: string, input: {
        triggerKey: string;
        channel: string;
        audience: string | null;
        subject: string | null;
        body: string;
    }): Promise<void>;
    updateTemplate(adminId: string, id: string, patch: {
        triggerKey?: string | undefined;
        channel?: string | undefined;
        audience?: string | null | undefined;
        subject?: string | null | undefined;
        body?: string | undefined;
        isActive?: boolean | undefined;
    }): Promise<boolean>;
}
export {};
