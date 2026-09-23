import { Injectable } from '@nestjs/common';

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

/**
 * Reads the commission rule set.
 *
 * Deliberately read-only and descriptive. Applying a rule is booking_quote()'s
 * job — this exists so an admin screen can show what rules exist and which one
 * a booking used, without a second implementation of the arithmetic.
 *
 * Writes belong to the admin module, where they are audited.
 */
@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  async listRules(callerId: string): Promise<CommissionRule[]> {
    const rows = await this.prisma.withUser(
      callerId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, name, model::text, percentage, fixed_amount, tiers,
               platform_fee_percentage, platform_fee_fixed, currency,
               applies_to::text, priority, effective_from, effective_to,
               is_active, tutor_id, agency_id, subject_id
        from public.commission_rules
        order by priority asc, created_at desc
      `,
    );
    return rows.map(toRule);
  }

  async findRule(callerId: string, id: string): Promise<CommissionRule | null> {
    const rows = await this.prisma.withUser(
      callerId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select id, name, model::text, percentage, fixed_amount, tiers,
               platform_fee_percentage, platform_fee_fixed, currency,
               applies_to::text, priority, effective_from, effective_to,
               is_active, tutor_id, agency_id, subject_id
        from public.commission_rules where id = ${id}::uuid
      `,
    );
    return rows[0] ? toRule(rows[0]) : null;
  }
}

function toRule(row: Record<string, unknown>): CommissionRule {
  const str = (v: unknown) => (v === null || v === undefined ? null : String(v));
  const date = (v: unknown) => (v instanceof Date ? v.toISOString() : null);
  return {
    id: String(row.id),
    name: String(row.name),
    model: String(row.model),
    percentage: str(row.percentage),
    fixedAmount: str(row.fixed_amount),
    tiers: row.tiers ?? null,
    platformFeePercentage: str(row.platform_fee_percentage),
    platformFeeFixed: str(row.platform_fee_fixed),
    currency: str(row.currency),
    appliesTo: String(row.applies_to),
    priority: Number(row.priority),
    effectiveFrom: date(row.effective_from),
    effectiveTo: date(row.effective_to),
    isActive: Boolean(row.is_active),
    tutorId: str(row.tutor_id),
    agencyId: str(row.agency_id),
    subjectId: str(row.subject_id),
  };
}
