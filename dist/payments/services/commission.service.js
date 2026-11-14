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
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CommissionService = class CommissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listRules(callerId) {
        const rows = await this.prisma.withUser(callerId, async (tx) => tx.$queryRaw `
        select id, name, model::text, percentage, fixed_amount, tiers,
               platform_fee_percentage, platform_fee_fixed, currency,
               applies_to::text, priority, effective_from, effective_to,
               is_active, tutor_id, agency_id, subject_id
        from public.commission_rules
        order by priority asc, created_at desc
      `);
        return rows.map(toRule);
    }
    async findRule(callerId, id) {
        const rows = await this.prisma.withUser(callerId, async (tx) => tx.$queryRaw `
        select id, name, model::text, percentage, fixed_amount, tiers,
               platform_fee_percentage, platform_fee_fixed, currency,
               applies_to::text, priority, effective_from, effective_to,
               is_active, tutor_id, agency_id, subject_id
        from public.commission_rules where id = ${id}::uuid
      `);
        return rows[0] ? toRule(rows[0]) : null;
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionService);
function toRule(row) {
    const str = (v) => (v === null || v === undefined ? null : String(v));
    const date = (v) => (v instanceof Date ? v.toISOString() : null);
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
//# sourceMappingURL=commission.service.js.map