import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { AdminSettingsRepository } from './admin-settings.repository';
import type { CreateCommissionRuleDto, CreateCurriculumDto, CreateSubjectDto, PlatformSettingDto, TemplateDto, UpdateTemplateDto } from './admin-settings.dto';
type Row = Record<string, unknown>;
export declare class AdminSettingsService {
    private readonly repository;
    private readonly audit;
    constructor(repository: AdminSettingsRepository, audit: AuditService);
    subjects(adminId: string): Promise<Row[]>;
    createSubject(adminId: string, dto: CreateSubjectDto): Promise<void>;
    setSubjectActive(adminId: string, id: string, isActive: boolean): Promise<void>;
    deleteSubject(adminId: string, id: string): Promise<void>;
    curricula(adminId: string): Promise<Row[]>;
    createCurriculum(adminId: string, dto: CreateCurriculumDto): Promise<void>;
    setCurriculumActive(adminId: string, id: string, isActive: boolean): Promise<void>;
    commissionRules(adminId: string): Promise<Row[]>;
    commissionTargets(adminId: string): Promise<{
        tutors: Row[];
        agencies: Row[];
    }>;
    createCommissionRule(adminId: string, dto: CreateCommissionRuleDto, context: AuditContext): Promise<void>;
    setCommissionRuleActive(adminId: string, id: string, isActive: boolean, context: AuditContext): Promise<void>;
    platformSettings(adminId: string, scope: 'payments' | 'general'): Promise<Row[]>;
    upsertSettings(adminId: string, settings: PlatformSettingDto[]): Promise<void>;
    updateSettingValue(adminId: string, key: string, value: unknown): Promise<void>;
    templates(adminId: string): Promise<Row[]>;
    createTemplate(adminId: string, dto: TemplateDto, context: AuditContext): Promise<void>;
    updateTemplate(adminId: string, id: string, dto: UpdateTemplateDto, context: AuditContext): Promise<void>;
    private run;
}
export {};
