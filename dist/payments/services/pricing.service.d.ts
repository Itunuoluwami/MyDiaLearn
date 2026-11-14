import { PrismaService } from '../../database/prisma.service';
import { PlatformSettingsService } from '../../platform-settings/platform-settings.service';
export interface BookingQuote {
    currency: string;
    hourlyRate: string;
    durationMinutes: number;
    lessonAmount: string;
    platformFee: string;
    processingFee: string;
    commissionAmount: string;
    totalAmount: string;
    commissionRuleId: string | null;
    cancellationPolicyId: string | null;
}
export declare class PricingService {
    private readonly prisma;
    private readonly settings;
    constructor(prisma: PrismaService, settings: PlatformSettingsService);
    quote(callerId: string, input: {
        tutorId: string;
        durationMinutes: number;
    }): Promise<BookingQuote>;
}
