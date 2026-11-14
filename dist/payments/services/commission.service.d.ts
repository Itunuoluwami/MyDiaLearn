import { PrismaService } from '../../database/prisma.service';
export interface CommissionRule {
    id: string;
    name: string;
    model: string;
    percentage: string | null;
    fixedAmount: string | null;
    tiers: unknown;
    platformFeePercentage: string | null;
    platformFeeFixed: string | null;
    currency: string | null;
    appliesTo: string;
    priority: number;
    effectiveFrom: string | null;
    effectiveTo: string | null;
    isActive: boolean;
    tutorId: string | null;
    agencyId: string | null;
    subjectId: string | null;
}
export declare class CommissionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listRules(callerId: string): Promise<CommissionRule[]>;
    findRule(callerId: string, id: string): Promise<CommissionRule | null>;
}
