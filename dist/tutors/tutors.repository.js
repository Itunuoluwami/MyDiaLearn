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
exports.TutorsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const TUTOR_COLUMNS = `
  id, profile_id, agency_id, headline, biography, qualifications, languages,
  hourly_rate, currency, years_experience, intro_video_url, timezone,
  verification_status::text, is_listed, education, methodology, teaching_context,
  onboarding_step, submitted_at, created_at, updated_at
`;
let TutorsRepository = class TutorsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async ensureOwn(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `select public.ensure_tutor_record()`;
            const rows = await tx.$queryRawUnsafe(`select ${TUTOR_COLUMNS} from public.tutors where profile_id = $1::uuid`, userId);
            return rows[0];
        });
    }
    async findOwn(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRawUnsafe(`select ${TUTOR_COLUMNS} from public.tutors where profile_id = $1::uuid`, userId);
            return rows[0] ?? null;
        });
    }
    async updateOwn(userId, input) {
        const qualifications = input.qualifications ? JSON.stringify(input.qualifications) : null;
        const languages = input.languages ? JSON.stringify(input.languages) : null;
        const education = input.education ? JSON.stringify(input.education) : null;
        const has = (key) => input[key] !== undefined;
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.tutors set
          headline         = case when ${has('headline')} then ${input.headline ?? null}::text else headline end,
          biography        = case when ${has('biography')} then ${input.biography ?? null}::text else biography end,
          qualifications   = coalesce(${qualifications}::jsonb, qualifications),
          languages        = coalesce(${languages}::jsonb, languages),
          education        = coalesce(${education}::jsonb, education),
          years_experience = case when ${has('yearsExperience')} then ${input.yearsExperience ?? null}::int else years_experience end,
          intro_video_url  = case when ${has('introVideoUrl')} then ${input.introVideoUrl ?? null}::text else intro_video_url end,
          timezone         = coalesce(${input.timezone ?? null}, timezone),
          methodology      = case when ${has('methodology')} then ${input.methodology ?? null}::text else methodology end,
          teaching_context = case when ${has('teachingContext')} then ${input.teachingContext ?? null}::text else teaching_context end,
          onboarding_step  = coalesce(${input.onboardingStep ?? null}::int, onboarding_step),
          is_listed        = coalesce(${input.isListed ?? null}::boolean, is_listed),
          updated_at       = now()
        where profile_id = ${userId}::uuid
        returning id, profile_id, agency_id, headline, biography, qualifications, languages,
                  hourly_rate, currency, years_experience, intro_video_url, timezone,
                  verification_status::text, is_listed, education, methodology,
                  teaching_context, onboarding_step, submitted_at, created_at, updated_at
      `;
            return rows[0] ?? null;
        });
    }
    async listSubjects(userId, tutorId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name
      `);
    }
    async replaceSubjects(userId, tutorId, entries) {
        return this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `delete from public.tutor_subjects where tutor_id = ${tutorId}::uuid`;
            for (const entry of entries) {
                await tx.$executeRaw `
          insert into public.tutor_subjects (tutor_id, subject_id, education_level_id)
          values (${tutorId}::uuid, ${entry.subjectId}::uuid, ${entry.educationLevelId ?? null}::uuid)
          on conflict do nothing
        `;
            }
            return tx.$queryRaw `
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid
        order by s.name
      `;
        });
    }
    async addSubject(userId, tutorId, subjectId, educationLevelId) {
        return this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `
        insert into public.tutor_subjects (tutor_id, subject_id, education_level_id)
        values (${tutorId}::uuid, ${subjectId}::uuid, ${educationLevelId ?? null}::uuid)
        on conflict do nothing
      `;
            const rows = await tx.$queryRaw `
        select ts.id, ts.subject_id, ts.education_level_id,
               s.name as subject_name, el.name as level_name
        from public.tutor_subjects ts
        join public.subjects s on s.id = ts.subject_id
        left join public.education_levels el on el.id = ts.education_level_id
        where ts.tutor_id = ${tutorId}::uuid and ts.subject_id = ${subjectId}::uuid
        limit 1
      `;
            return rows[0];
        });
    }
    async removeSubject(userId, id) {
        const n = await this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        delete from public.tutor_subjects
        where id = ${id}::uuid and tutor_id = public.current_tutor_id()
      `);
        return n > 0;
    }
    async dashboardSummary(userId) {
        const rows = await this.prisma.withUser(userId, async (tx) => tx.$queryRaw `select * from public.tutor_dashboard_summary()`);
        return rows[0] ?? null;
    }
    async students(userId, query) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select * from public.tutor_students(${query.limit}, ${query.skip})
      `);
    }
    async reviews(userId, query) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select * from public.tutor_reviews(${query.limit}, ${query.skip})
      `);
    }
    async ratingSummary(userId) {
        const rows = await this.prisma.withUser(userId, async (tx) => tx.$queryRaw `select * from public.tutor_rating_summary()`);
        return rows[0] ?? null;
    }
    async ratingCategories(userId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `select * from public.tutor_rating_categories()`);
    }
};
exports.TutorsRepository = TutorsRepository;
exports.TutorsRepository = TutorsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TutorsRepository);
//# sourceMappingURL=tutors.repository.js.map