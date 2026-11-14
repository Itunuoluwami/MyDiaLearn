import type { Request } from 'express';
import { type AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateCommissionRuleDto, CreateCurriculumDto, CreateSubjectDto, PlatformSettingDto, PlatformSettingsQueryDto, SetActiveDto, TemplateDto, UpdateSettingValueDto, UpdateTemplateDto, UpsertPlatformSettingsDto } from './admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';
type Row = Record<string, unknown>;
export declare class AdminSettingsController {
    private readonly settings;
    constructor(settings: AdminSettingsService);
    subjects(user: AuthenticatedUser): Promise<Row[]>;
    createSubject(user: AuthenticatedUser, dto: CreateSubjectDto): Promise<void>;
    setSubjectActive(user: AuthenticatedUser, id: string, dto: SetActiveDto): Promise<void>;
    deleteSubject(user: AuthenticatedUser, id: string): Promise<void>;
    curricula(user: AuthenticatedUser): Promise<Row[]>;
    createCurriculum(user: AuthenticatedUser, dto: CreateCurriculumDto): Promise<void>;
    setCurriculumActive(user: AuthenticatedUser, id: string, dto: SetActiveDto): Promise<void>;
    commissionRules(user: AuthenticatedUser): Promise<Row[]>;
    commissionTargets(user: AuthenticatedUser): Promise<{
        tutors: Row[];
        agencies: Row[];
    }>;
    createCommissionRule(user: AuthenticatedUser, dto: CreateCommissionRuleDto, request: Request): Promise<void>;
    setCommissionRuleActive(user: AuthenticatedUser, id: string, dto: SetActiveDto, request: Request): Promise<void>;
    platformSettings(user: AuthenticatedUser, query: PlatformSettingsQueryDto): Promise<Row[]>;
    upsertSettings(user: AuthenticatedUser, dto: UpsertPlatformSettingsDto): Promise<void>;
    createSetting(user: AuthenticatedUser, dto: PlatformSettingDto): Promise<void>;
    updateSettingValue(user: AuthenticatedUser, key: string, dto: UpdateSettingValueDto): Promise<void>;
    templates(user: AuthenticatedUser): Promise<Row[]>;
    createTemplate(user: AuthenticatedUser, dto: TemplateDto, request: Request): Promise<void>;
    updateTemplate(user: AuthenticatedUser, id: string, dto: UpdateTemplateDto, request: Request): Promise<void>;
}
export {};
