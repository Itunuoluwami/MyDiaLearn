export declare class SetActiveDto {
    isActive: boolean;
}
export declare class CreateSubjectDto {
    name: string;
    slug: string;
    category?: string;
    sortOrder: number;
}
export declare class CreateCurriculumDto {
    name: string;
    code: string;
    countryCode?: string;
    sortOrder: number;
}
export declare class TierDto {
    min: number;
    max?: number | null;
    percentage: number;
}
export declare class CreateCommissionRuleDto {
    name: string;
    model: 'percentage' | 'fixed' | 'tiered';
    percentage?: number;
    fixedAmount?: number;
    platformFeePercentage: number;
    appliesTo: string;
    tutorId?: string;
    agencyId?: string;
    tiers: TierDto[];
    priority: number;
}
export declare class PlatformSettingsQueryDto {
    scope: 'payments' | 'general';
}
export declare class PlatformSettingDto {
    key: string;
    value: unknown;
    label?: string;
    description?: string;
    groupName?: string;
}
export declare class UpsertPlatformSettingsDto {
    settings: PlatformSettingDto[];
}
export declare class UpdateSettingValueDto {
    value: unknown;
}
export declare class TemplateDto {
    triggerKey: string;
    channel: string;
    audience?: string;
    subject?: string;
    body: string;
}
export declare class UpdateTemplateDto {
    triggerKey?: string;
    channel?: string;
    audience?: string | null;
    subject?: string | null;
    body?: string;
    isActive?: boolean;
}
