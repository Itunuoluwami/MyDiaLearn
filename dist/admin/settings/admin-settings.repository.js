"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const base_repository_1 = require("../../database/repositories/base.repository");
let AdminSettingsRepository = class AdminSettingsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async subjects(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, name, slug, category, is_active, sort_order
        from public.subjects order by sort_order
      `);
    }
    async createSubject(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        insert into public.subjects (name, slug, category, sort_order)
        values (${input.name}, ${input.slug}, ${input.category}, ${input.sortOrder})
      `;
        });
    }
    async setSubjectActive(adminId, id, isActive) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.subjects set is_active = ${isActive}, updated_at = now() where id = ${id}::uuid
      `;
            return n > 0;
        });
    }
    async deleteSubject(adminId, id) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `delete from public.subjects where id = ${id}::uuid`;
            return n > 0;
        });
    }
    async curricula(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select c.id, c.name, c.code, c.country_code, c.is_active,
               coalesce((select json_agg(json_build_object('id', el.id, 'name', el.name) order by el.sort_order)
                         from public.education_levels el where el.curriculum_id = c.id), '[]'::json)
                 as education_levels
        from public.curricula c order by c.sort_order
      `);
    }
    async createCurriculum(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        insert into public.curricula (name, code, country_code, sort_order)
        values (${input.name}, ${input.code}, ${input.countryCode}, ${input.sortOrder})
      `;
        });
    }
    async setCurriculumActive(adminId, id, isActive) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.curricula set is_active = ${isActive}, updated_at = now() where id = ${id}::uuid
      `;
            return n > 0;
        });
    }
    async commissionRules(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, name, model::text, percentage, fixed_amount, platform_fee_percentage,
               applies_to::text, priority, is_active, tutor_id, agency_id, tiers
        from public.commission_rules order by priority desc
      `);
    }
    async commissionTargets(adminId) {
        return this.prisma.withUser(adminId, async (tx) => {
            const tutors = await tx.$queryRaw `
        select t.id, p.full_name from public.tutors t
        left join public.profiles p on p.id = t.profile_id
        order by t.created_at desc limit 200
      `;
            const agencies = await tx.$queryRaw `
        select id, name from public.tutor_agencies order by name
      `;
            return { tutors, agencies };
        });
    }
    async createCommissionRule(adminId, input) {
        return this.prisma.withUser(adminId, async (tx) => {
            const rows = await tx.$queryRaw `
        insert into public.commission_rules
          (name, model, percentage, fixed_amount, platform_fee_percentage, applies_to,
           tutor_id, agency_id, tiers, priority)
        values (${input.name}, ${input.model}::public.commission_model, ${input.percentage},
                ${input.fixedAmount}, ${input.platformFeePercentage},
                ${input.appliesTo}::public.app_role, ${input.tutorId}::uuid,
                ${input.agencyId}::uuid, ${JSON.stringify(input.tiers)}::jsonb, ${input.priority})
        returning id
      `;
            return rows[0].id;
        });
    }
    async setCommissionRuleActive(adminId, id, isActive) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.commission_rules set is_active = ${isActive}, updated_at = now()
        where id = ${id}::uuid
      `;
            return n > 0;
        });
    }
    async platformSettings(adminId, scope) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select key, label, description, group_name, is_public, value
        from public.platform_settings
        where case when ${scope} = 'payments' then key ilike 'payments.%'
                   else key not ilike 'payments.%' end
        order by group_name, key
      `);
    }
    async upsertSettings(adminId, settings) {
        await this.prisma.withUser(adminId, async (tx) => {
            for (const s of settings) {
                await tx.$executeRaw `
          insert into public.platform_settings
            (key, value, label, description, group_name, is_public, updated_by)
          values (${s.key}, ${JSON.stringify(s.value ?? null)}::jsonb, coalesce(${s.label}, ${s.key}),
                  ${s.description}, coalesce(${s.groupName}, 'general'), false, ${adminId}::uuid)
          on conflict (key) do update set
            value = excluded.value,
            label = coalesce(${s.label}, platform_settings.label),
            description = coalesce(${s.description}, platform_settings.description),
            group_name = coalesce(${s.groupName}, platform_settings.group_name),
            updated_by = excluded.updated_by,
            updated_at = now()
        `;
            }
        });
    }
    async updateSettingValue(adminId, key, value) {
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.platform_settings
        set value = ${JSON.stringify(value ?? null)}::jsonb, updated_by = ${adminId}::uuid, updated_at = now()
        where key = ${key}
      `;
            return n > 0;
        });
    }
    async templates(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, trigger_key, channel::text, audience::text, subject, body, description, is_active
        from public.notification_templates order by trigger_key
      `);
    }
    async createTemplate(adminId, input) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        insert into public.notification_templates (trigger_key, channel, audience, subject, body)
        values (${input.triggerKey}, ${input.channel}::public.notification_channel,
                ${input.audience}::public.app_role, ${input.subject}, ${input.body})
      `;
        });
    }
    async updateTemplate(adminId, id, patch) {
        const has = (key) => patch[key] !== undefined;
        return this.prisma.withUser(adminId, async (tx) => {
            const n = await tx.$executeRaw `
        update public.notification_templates set
          trigger_key = coalesce(${patch.triggerKey ?? null}, trigger_key),
          channel = coalesce(${patch.channel ?? null}::public.notification_channel, channel),
          audience = case when ${has('audience')} then ${patch.audience ?? null}::public.app_role else audience end,
          subject = case when ${has('subject')} then ${patch.subject ?? null}::text else subject end,
          body = coalesce(${patch.body ?? null}, body),
          is_active = coalesce(${patch.isActive ?? null}::boolean, is_active),
          updated_at = now()
        where id = ${id}::uuid
      `;
            return n > 0;
        });
    }
};
exports.AdminSettingsRepository = AdminSettingsRepository;
exports.AdminSettingsRepository = AdminSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminSettingsRepository);
//# sourceMappingURL=admin-settings.repository.js.map