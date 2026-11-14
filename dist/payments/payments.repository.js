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
exports.PaymentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const PAYMENT_COLUMNS = `
  p.id, p.booking_id, p.payer_id, p.tutor_id, p.amount, p.currency, p.platform_fee,
  p.commission_amount, p.tutor_payout, p.status::text, p.provider, p.provider_reference,
  p.paid_at, p.refunded_amount, p.failure_reason, p.created_at
`;
let PaymentsRepository = class PaymentsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async listForUser(userId, query) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, booking_id, payer_id, tutor_id, amount, currency, platform_fee,
               commission_amount, tutor_payout, status::text, provider, provider_reference,
               paid_at, refunded_amount, created_at
        from public.payments
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.payments
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async findById(userId, id) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, booking_id, payer_id, tutor_id, amount, currency, platform_fee,
               commission_amount, tutor_payout, status::text, provider, provider_reference,
               paid_at, refunded_amount, created_at
        from public.payments where id = ${id}::uuid
      `;
            return rows[0] ?? null;
        });
    }
    async earningsRecords(tutorUserId, query) {
        return this.prisma.withUser(tutorUserId, async (tx) => tx.$queryRaw `
        select * from public.tutor_earnings_records(${query.limit}, ${query.skip})
      `);
    }
    async requestPayout(tutorUserId, amount) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.tutor_request_payout(${amount}::numeric) as id
      `;
            return rows[0].id;
        });
    }
    async listPayouts(userId, query) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, tutor_id, amount, currency, status::text, reference, notes,
               requested_at, settled_at
        from public.payouts
        order by requested_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.payouts
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async prepare(payerId, bookingId, provider) {
        return this.prisma.withUser(payerId, async (tx) => {
            const rows = await tx.$queryRaw `
        select * from public.payment_prepare(${bookingId}::uuid, ${provider})
      `;
            return rows[0];
        });
    }
    async forProcessing(paymentId) {
        const rows = await this.prisma.$queryRawUnsafe(`select ${PAYMENT_COLUMNS},
              coalesce(cur.decimals, 2)::int as currency_decimals,
              pr.email as payer_email, pr.full_name as payer_name,
              b.status::text as booking_status
       from public.payments p
       join public.bookings b on b.id = p.booking_id
       left join public.currencies cur on cur.code = p.currency
       left join public.profiles pr on pr.id = p.payer_id
       where p.id = $1::uuid`, paymentId);
        return rows[0] ?? null;
    }
    async findIdByProviderReference(provider, providerReference) {
        const rows = await this.prisma.$queryRaw `
      select id from public.payments
      where provider = ${provider} and provider_reference = ${providerReference}
      order by created_at desc limit 1
    `;
        return rows[0]?.id ?? null;
    }
    async setProviderReference(paymentId, providerReference) {
        await this.prisma.$executeRaw `
      update public.payments set provider_reference = ${providerReference}
      where id = ${paymentId}::uuid and provider_reference is distinct from ${providerReference}
    `;
    }
    async bookingSubject(bookingId) {
        const rows = await this.prisma.$queryRaw `
      select sub.name
      from public.bookings b
      left join public.subjects sub on sub.id = b.subject_id
      where b.id = ${bookingId}::uuid
      limit 1
    `;
        return rows[0]?.name ?? null;
    }
    async payoutRecipient(payoutId) {
        const rows = await this.prisma.$queryRaw `
      select p.email, po.amount::text as amount, po.currency
      from public.payouts po
      join public.tutors t    on t.id = po.tutor_id
      join public.profiles p  on p.id = t.profile_id
      where po.id = ${payoutId}::uuid
      limit 1
    `;
        return rows[0] ?? null;
    }
    async markPaid(paymentId, providerReference, amount, currency) {
        const rows = await this.prisma.$queryRaw `
      select * from public.payment_mark_paid(
        ${paymentId}::uuid, ${providerReference}, ${amount}::numeric, ${currency}
      )
    `;
        return rows[0];
    }
    async markFailed(paymentId, reason) {
        const rows = await this.prisma.$queryRaw `
      select * from public.payment_mark_failed(${paymentId}::uuid, ${reason})
    `;
        return rows[0];
    }
    async recordEvent(event) {
        const rows = await this.prisma.$queryRaw `
      insert into public.payment_events
        (payment_id, refund_id, provider, provider_event_id, source, event_type, status,
         amount, currency, details)
      values (${event.paymentId}::uuid, ${event.refundId ?? null}::uuid, ${event.provider},
              ${event.providerEventId ?? null}, ${event.source}, ${event.eventType},
              ${event.status ?? null}, ${event.amount ?? null}::numeric, ${event.currency ?? null},
              ${JSON.stringify(event.details ?? {})}::jsonb)
      on conflict (provider, provider_event_id) where provider_event_id is not null do nothing
      returning id
    `;
        return rows.length > 0;
    }
    async pendingRefunds(paymentId, maxAttempts) {
        return this.prisma.$queryRaw `
      select r.id, r.payment_id, r.amount, r.currency, coalesce(cur.decimals, 2)::int as currency_decimals,
             r.idempotency_key, r.status, r.attempts,
             p.provider as payment_provider, p.provider_reference as payment_provider_reference
      from public.payment_refunds r
      join public.payments p on p.id = r.payment_id
      left join public.currencies cur on cur.code = r.currency
      where r.status = 'pending' and r.attempts < ${maxAttempts}
        and (${paymentId}::uuid is null or r.payment_id = ${paymentId}::uuid)
      order by r.requested_at
      limit 50
    `;
    }
    async findRefundByKey(key) {
        const rows = await this.prisma.$queryRaw `
      select id, payment_id from public.payment_refunds where idempotency_key = ${key}
    `;
        return rows[0] ?? null;
    }
    async findRefundByProviderReference(reference) {
        const rows = await this.prisma.$queryRaw `
      select id, payment_id from public.payment_refunds where provider_refund_reference = ${reference}
    `;
        return rows[0] ?? null;
    }
    async recordRefundOutcome(refundId, outcome) {
        await this.prisma.$executeRaw `
      update public.payment_refunds set
        status = ${outcome.status},
        provider = ${outcome.provider},
        provider_refund_reference = coalesce(${outcome.providerRefundReference}, provider_refund_reference),
        failure_reason = ${outcome.failureReason},
        attempts = attempts + ${outcome.countAttempt ? 1 : 0},
        completed_at = case when ${outcome.status} in ('succeeded', 'failed') then now() end
      where id = ${refundId}::uuid and status = 'pending'
    `;
    }
};
exports.PaymentsRepository = PaymentsRepository;
exports.PaymentsRepository = PaymentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsRepository);
//# sourceMappingURL=payments.repository.js.map