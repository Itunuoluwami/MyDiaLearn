import { PrismaService } from '../../database/prisma.service';
import { PlatformSettingsService } from '../../platform-settings/platform-settings.service';
export interface SettlementPolicy {
    minimumAmount: number;
    settlementDays: number;
    scheduleLabel: string;
    nextPayoutDate: string | null;
    currency: string;
}
export interface EarningsSummary {
    currency: string;
    grossRevenue: string;
    platformCommission: string;
    paymentFees: string;
    netEarnings: string;
    pendingEarnings: string;
    paidOut: string;
    pendingPayouts: string;
    availableBalance: string;
    minimumPayout: string;
    nextPayoutDate: string | null;
    scheduleLabel: string | null;
}
export declare class SettlementService {
    private readonly prisma;
    private readonly settings;
    constructor(prisma: PrismaService, settings: PlatformSettingsService);
    policy(): Promise<SettlementPolicy>;
    earnings(tutorUserId: string): Promise<EarningsSummary | null>;
    assertPayoutAllowed(amount: number): Promise<void>;
}
