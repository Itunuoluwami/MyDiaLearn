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
exports.CatalogueRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let CatalogueRepository = class CatalogueRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async subjects() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `select * from public.public_subject_facets()`);
    }
    async curricula() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `select * from public.public_curriculum_facets()`);
    }
    async countries() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `select * from public.public_country_facets()`);
    }
    async educationLevels() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select id, name, code, curriculum_id, sort_order
        from public.education_levels
        order by sort_order nulls last, name
      `);
    }
    async currencies() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select code, name, symbol, is_active
        from public.currencies
        where is_active
        order by code
      `);
    }
    async searchSuggestions(q, limit) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select * from public.public_search_suggestions(${q}, ${limit})
      `);
    }
    async searchTutors(filters) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select * from public.public_tutor_search(
          ${filters.q ?? null}::text,
          ${filters.subjectId ?? null}::uuid,
          ${filters.curriculumId ?? null}::uuid,
          ${filters.country ?? null}::text,
          ${filters.educationLevelId ?? null}::uuid,
          ${filters.language ?? null}::text,
          ${filters.minRating ?? null}::numeric,
          ${filters.maxPrice ?? null}::numeric,
          ${filters.sort ?? null}::text,
          ${filters.limit},
          ${filters.offset}
        )
      `);
    }
    async tutorDetail(tutorId) {
        const rows = await this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select * from public.public_tutor_detail(${tutorId}::uuid)
      `);
        return rows[0] ?? null;
    }
    async tutorReviews(tutorId, limit) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select * from public.public_tutor_reviews(${tutorId}::uuid, ${limit})
      `);
    }
    async publicSettings() {
        const rows = await this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select key, value from public.platform_settings where is_public
      `);
        return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    }
    async tutorSubjects(tutorId) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select ts.subject_id, ts.education_level_id, s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.tutors t on t.id = ts.tutor_id and t.is_listed
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name, el.sort_order
      `);
    }
    async cancellationPolicies() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select id, name, description, hours_before, refund_percentage, is_default
        from public.cancellation_policies
        where is_active
        order by hours_before nulls last
      `);
    }
    async verificationSteps() {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select id, name, code, description, applies_to::text, is_required, sort_order
        from public.verification_steps where is_active order by sort_order, name
      `);
    }
    async commissionExample() {
        const rows = await this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select model::text, percentage, platform_fee_percentage, platform_fee_fixed, currency
        from public.commission_rules
        where is_active and tutor_id is null and agency_id is null and subject_id is null
        order by priority asc limit 1
      `);
        return rows[0] ?? null;
    }
    async tutorCards(ids) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select * from public.public_tutor_cards(${ids}::uuid[])
      `);
    }
};
exports.CatalogueRepository = CatalogueRepository;
exports.CatalogueRepository = CatalogueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogueRepository);
//# sourceMappingURL=catalogue.repository.js.map