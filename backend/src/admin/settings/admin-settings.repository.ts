import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/repositories/base.repository';

type Row = Record<string, unknown>;

/**
 * Admin-managed lookup and configuration tables: subjects, curricula,
 * commission rules, platform settings and notification templates.
 *
 * These are the values the rest of the platform reads instead of hardcoding,
 * so writes here go straight to the tables the pricing functions and the
 * notification dispatcher read. Every call runs in the admin's claims.
 */
@Injectable()
export class AdminSettingsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // --- Subjects ----------------------------------------------------------------

  async subjects(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, name, slug, category, is_active, sort_order
        from public.subjects order by sort_order
      `,
    );
  }

  async createSubject(
    adminId: string,
    input: { name: string; slug: string; category: string | null; sortOrder: number },
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        insert into public.subjects (name, slug, category, sort_order)
        values (${input.name}, ${input.slug}, ${input.category}, ${input.sortOrder})
      `;
    });
  }

  async setSubjectActive(adminId: string, id: string, isActive: boolean): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`
        update public.subjects set is_active = ${isActive}, updated_at = now() where id = ${id}::uuid
      `;
      return n > 0;
    });
  }

  async deleteSubject(adminId: string, id: string): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`delete from public.subjects where id = ${id}::uuid`;
      return n > 0;
    });
  }

  // --- Curricula ---------------------------------------------------------------

  async curricula(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select c.id, c.name, c.code, c.country_code, c.is_active,
               coalesce((select json_agg(json_build_object('id', el.id, 'name', el.name) order by el.sort_order)
                         from public.education_levels el where el.curriculum_id = c.id), '[]'::json)
                 as education_levels
        from public.curricula c order by c.sort_order
      `,
    );
  }

  async createCurriculum(
    adminId: string,
    input: { name: string; code: string; countryCode: string | null; sortOrder: number },
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        insert into public.curricula (name, code, country_code, sort_order)
        values (${input.name}, ${input.code}, ${input.countryCode}, ${input.sortOrder})
      `;
    });
  }

  async setCurriculumActive(adminId: string, id: string, isActive: boolean): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`
        update public.curricula set is_active = ${isActive}, updated_at = now() where id = ${id}::uuid
      `;
      return n > 0;
    });
  }

  // --- Commission rules ----------------------------------------------------------

  async commissionRules(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, name, model::text, percentage, fixed_amount, platform_fee_percentage,
               applies_to::text, priority, is_active, tutor_id, agency_id, tiers
        from public.commission_rules order by priority desc
      `,
    );
  }

  /** The pickers on the commission form. */
  async commissionTargets(adminId: string): Promise<{ tutors: Row[]; agencies: Row[] }> {
    return this.prisma.withUser(adminId, async (tx) => {
      const tutors = await tx.$queryRaw<Row[]>`
        select t.id, p.full_name from public.tutors t
        left join public.profiles p on p.id = t.profile_id
        order by t.created_at desc limit 200
      `;
      const agencies = await tx.$queryRaw<Row[]>`
        select id, name from public.tutor_agencies order by name
      `;
      return { tutors, agencies };
    });
  }

  async createCommissionRule(
    adminId: string,
    input: {
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
    },
  ): Promise<string> {
    return this.prisma.withUser(adminId, async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        insert into public.commission_rules
          (name, model, percentage, fixed_amount, platform_fee_percentage, applies_to,
           tutor_id, agency_id, tiers, priority)
        values (${input.name}, ${input.model}::public.commission_model, ${input.percentage},
                ${input.fixedAmount}, ${input.platformFeePercentage},
                ${input.appliesTo}::public.app_role, ${input.tutorId}::uuid,
                ${input.agencyId}::uuid, ${JSON.stringify(input.tiers)}::jsonb, ${input.priority})
        returning id
      `;
      return rows[0]!.id;
    });
  }

  async setCommissionRuleActive(
    adminId: string,
    id: string,
    isActive: boolean,
  ): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`
        update public.commission_rules set is_active = ${isActive}, updated_at = now()
        where id = ${id}::uuid
      `;
      return n > 0;
    });
  }

  // --- Platform settings ---------------------------------------------------------

  async platformSettings(adminId: string, scope: 'payments' | 'general'): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select key, label, description, group_name, is_public, value
        from public.platform_settings
        where case when ${scope} = 'payments' then key ilike 'payments.%'
                   else key not ilike 'payments.%' end
        order by group_name, key
      `,
    );
  }

  /** Insert or update by key. New rows are private unless made public elsewhere. */
  async upsertSettings(
    adminId: string,
    settings: {
      key: string;
      value: unknown;
      label: string | null;
      description: string | null;
      groupName: string | null;
    }[],
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      for (const s of settings) {
        await tx.$executeRaw`
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

  async updateSettingValue(adminId: string, key: string, value: unknown): Promise<boolean> {
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`
        update public.platform_settings
        set value = ${JSON.stringify(value ?? null)}::jsonb, updated_by = ${adminId}::uuid, updated_at = now()
        where key = ${key}
      `;
      return n > 0;
    });
  }

  // --- Notification templates ----------------------------------------------------

  async templates(adminId: string): Promise<Row[]> {
    return this.prisma.withUser(
      adminId,
      async (tx) =>
        tx.$queryRaw<Row[]>`
        select id, trigger_key, channel::text, audience::text, subject, body, description, is_active
        from public.notification_templates order by trigger_key
      `,
    );
  }

  async createTemplate(
    adminId: string,
    input: {
      triggerKey: string;
      channel: string;
      audience: string | null;
      subject: string | null;
      body: string;
    },
  ): Promise<void> {
    await this.prisma.withUser(adminId, async (tx) => {
      await tx.$executeRaw`
        insert into public.notification_templates (trigger_key, channel, audience, subject, body)
        values (${input.triggerKey}, ${input.channel}::public.notification_channel,
                ${input.audience}::public.app_role, ${input.subject}, ${input.body})
      `;
    });
  }

  /** Only the fields present in `patch` change; `null` clears audience/subject. */
  async updateTemplate(
    adminId: string,
    id: string,
    patch: {
      triggerKey?: string | undefined;
      channel?: string | undefined;
      audience?: string | null | undefined;
      subject?: string | null | undefined;
      body?: string | undefined;
      isActive?: boolean | undefined;
    },
  ): Promise<boolean> {
    const has = (key: keyof typeof patch) => patch[key] !== undefined;
    return this.prisma.withUser(adminId, async (tx) => {
      const n = await tx.$executeRaw`
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
}
