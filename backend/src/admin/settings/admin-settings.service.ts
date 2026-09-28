import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../../common/audit/audit.service';
import { NotFoundError } from '../../common/exceptions/app.exception';
import { translateAdminError } from '../admin-errors';
import { AdminSettingsRepository } from './admin-settings.repository';
import type {
  CreateCommissionRuleDto,
  CreateCurriculumDto,
  CreateSubjectDto,
  PlatformSettingDto,
  TemplateDto,
  UpdateTemplateDto,
} from './admin-settings.dto';

type Row = Record<string, unknown>;

/**
 * Admin configuration. Values are written as the admin enters them — this
 * layer does not reinterpret a commission rule or a fee, it stores it for the
 * PL/pgSQL that applies it. Changes that affect money or messaging are
 * audited here; platform_settings also has its own audit trigger.
 */
@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly repository: AdminSettingsRepository,
    private readonly audit: AuditService,
  ) {}

  subjects(adminId: string): Promise<Row[]> {
    return this.repository.subjects(adminId);
  }

  async createSubject(adminId: string, dto: CreateSubjectDto): Promise<void> {
    await this.run(() =>
      this.repository.createSubject(adminId, {
        name: dto.name.trim(),
        slug: dto.slug,
        category: dto.category?.trim() || null,
        sortOrder: dto.sortOrder,
      }),
    );
  }

  async setSubjectActive(adminId: string, id: string, isActive: boolean): Promise<void> {
    if (!(await this.repository.setSubjectActive(adminId, id, isActive))) {
      throw new NotFoundError('Subject');
    }
  }

  async deleteSubject(adminId: string, id: string): Promise<void> {
    // A subject still referenced by tutors or bookings is refused by its
    // foreign keys; that surfaces as a clear error rather than a cascade.
    const found = await this.run(() => this.repository.deleteSubject(adminId, id));
    if (!found) throw new NotFoundError('Subject');
  }

  curricula(adminId: string): Promise<Row[]> {
    return this.repository.curricula(adminId);
  }

  async createCurriculum(adminId: string, dto: CreateCurriculumDto): Promise<void> {
    await this.run(() =>
      this.repository.createCurriculum(adminId, {
        name: dto.name.trim(),
        code: dto.code,
        countryCode: dto.countryCode?.trim().toUpperCase() || null,
        sortOrder: dto.sortOrder,
      }),
    );
  }

  async setCurriculumActive(adminId: string, id: string, isActive: boolean): Promise<void> {
    if (!(await this.repository.setCurriculumActive(adminId, id, isActive))) {
      throw new NotFoundError('Curriculum');
    }
  }

  commissionRules(adminId: string): Promise<Row[]> {
    return this.repository.commissionRules(adminId);
  }

  commissionTargets(adminId: string): Promise<{ tutors: Row[]; agencies: Row[] }> {
    return this.repository.commissionTargets(adminId);
  }

  async createCommissionRule(
    adminId: string,
    dto: CreateCommissionRuleDto,
    context: AuditContext,
  ): Promise<void> {
    const id = await this.run(() =>
      this.repository.createCommissionRule(adminId, {
        name: dto.name.trim(),
        model: dto.model,
        percentage: dto.percentage ?? null,
        fixedAmount: dto.fixedAmount ?? null,
        platformFeePercentage: dto.platformFeePercentage,
        appliesTo: dto.appliesTo,
        tutorId: dto.tutorId ?? null,
        agencyId: dto.agencyId ?? null,
        tiers: dto.model === 'tiered' ? dto.tiers : [],
        priority: dto.priority,
      }),
    );
    await this.audit.record('admin.settings_changed', {
      actorId: adminId,
      entityType: 'commission_rule',
      entityId: id,
      context,
      metadata: {
        scope: 'commission_rule_created',
        model: dto.model,
        percentage: dto.percentage ?? null,
        fixedAmount: dto.fixedAmount ?? null,
        platformFeePercentage: dto.platformFeePercentage,
      },
    });
  }

  async setCommissionRuleActive(
    adminId: string,
    id: string,
    isActive: boolean,
    context: AuditContext,
  ): Promise<void> {
    if (!(await this.repository.setCommissionRuleActive(adminId, id, isActive))) {
      throw new NotFoundError('Commission rule');
    }
    await this.audit.record('admin.settings_changed', {
      actorId: adminId,
      entityType: 'commission_rule',
      entityId: id,
      context,
      metadata: { scope: 'commission_rule_toggled', isActive },
    });
  }

  platformSettings(adminId: string, scope: 'payments' | 'general'): Promise<Row[]> {
    return this.repository.platformSettings(adminId, scope);
  }

  async upsertSettings(adminId: string, settings: PlatformSettingDto[]): Promise<void> {
    await this.run(() =>
      this.repository.upsertSettings(
        adminId,
        settings.map((s) => ({
          key: s.key,
          value: s.value,
          label: s.label ?? null,
          description: s.description ?? null,
          groupName: s.groupName ?? null,
        })),
      ),
    );
  }

  async updateSettingValue(adminId: string, key: string, value: unknown): Promise<void> {
    if (!(await this.run(() => this.repository.updateSettingValue(adminId, key, value)))) {
      throw new NotFoundError('Setting');
    }
  }

  templates(adminId: string): Promise<Row[]> {
    return this.repository.templates(adminId);
  }

  async createTemplate(
    adminId: string,
    dto: TemplateDto,
    context: AuditContext,
  ): Promise<void> {
    await this.run(() =>
      this.repository.createTemplate(adminId, {
        triggerKey: dto.triggerKey,
        channel: dto.channel,
        audience: dto.audience || null,
        subject: dto.subject || null,
        body: dto.body,
      }),
    );
    await this.audit.record('admin.settings_changed', {
      actorId: adminId,
      entityType: 'notification_template',
      context,
      metadata: {
        scope: 'template_created',
        triggerKey: dto.triggerKey,
        channel: dto.channel,
      },
    });
  }

  async updateTemplate(
    adminId: string,
    id: string,
    dto: UpdateTemplateDto,
    context: AuditContext,
  ): Promise<void> {
    const found = await this.run(() =>
      this.repository.updateTemplate(adminId, id, {
        triggerKey: dto.triggerKey,
        channel: dto.channel,
        ...(dto.audience !== undefined ? { audience: dto.audience || null } : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject || null } : {}),
        body: dto.body,
        isActive: dto.isActive,
      }),
    );
    if (!found) throw new NotFoundError('Template');
    await this.audit.record('admin.settings_changed', {
      actorId: adminId,
      entityType: 'notification_template',
      entityId: id,
      context,
      metadata: { scope: 'template_updated', fields: Object.keys(dto) },
    });
  }

  /** Unique and foreign-key violations become 409s with the database's reason. */
  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/23505|duplicate key/i.test(message)) {
        throw translateAdminError(new Error('ALREADY_EXISTS'), 'That already exists.');
      }
      if (/23503|foreign key/i.test(message)) {
        throw translateAdminError(new Error('IN_USE'), 'That is still in use.');
      }
      throw translateAdminError(error, 'We could not save that setting.');
    }
  }
}
