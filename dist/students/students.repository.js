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
exports.StudentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const STUDENT_COLUMNS = `
  id, profile_id, parent_id, first_name, last_name, date_of_birth, gender,
  curriculum_id, education_level_id, school_name, learning_goals, special_needs,
  timezone, avatar_url, can_self_login, can_book_lessons, can_message_tutors,
  is_active, created_at
`;
let StudentsRepository = class StudentsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async list(userId, query) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRawUnsafe(`select s.id, s.profile_id, s.parent_id, s.first_name, s.last_name,
                s.date_of_birth, s.gender, s.curriculum_id, s.education_level_id,
                s.school_name, s.learning_goals, s.special_needs, s.timezone,
                s.avatar_url, s.can_self_login, s.can_book_lessons,
                s.can_message_tutors, s.is_active, s.created_at,
                cur.name as curriculum_name, el.name as education_level_name
         from public.students s
         left join public.curricula cur on cur.id = s.curriculum_id
         left join public.education_levels el on el.id = s.education_level_id
         order by s.is_active desc, s.first_name
         limit $1 offset $2`, query.limit, query.skip);
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.students
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async findById(userId, id) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRawUnsafe(`select ${STUDENT_COLUMNS} from public.students where id = $1::uuid`, id);
            return rows[0] ?? null;
        });
    }
    async findOrCreateOwn(userId, create) {
        return this.prisma.withUser(userId, async (tx) => {
            const select = () => tx.$queryRaw `
          select s.id, s.profile_id, s.parent_id, s.first_name, s.last_name,
                 s.date_of_birth, s.gender, s.curriculum_id, s.education_level_id,
                 s.school_name, s.learning_goals, s.special_needs, s.timezone,
                 s.avatar_url, s.can_self_login, s.can_book_lessons,
                 s.can_message_tutors, s.is_active, s.created_at,
                 cur.name as curriculum_name, el.name as education_level_name
          from public.students s
          left join public.curricula cur on cur.id = s.curriculum_id
          left join public.education_levels el on el.id = s.education_level_id
          where s.profile_id = ${userId}::uuid
          order by s.created_at
          limit 1
        `;
            const existing = await select();
            if (existing[0] || !create)
                return existing[0] ?? null;
            await tx.$executeRaw `select pg_advisory_xact_lock(hashtext(${`student-self:${userId}`}))`;
            const again = await select();
            if (again[0])
                return again[0];
            await tx.$executeRaw `
        insert into public.students (
          profile_id, first_name, last_name, timezone,
          can_self_login, can_book_lessons, can_message_tutors
        )
        select p.id,
               coalesce(nullif(split_part(btrim(coalesce(p.full_name, '')), ' ', 1), ''), 'Student'),
               nullif(btrim(substr(btrim(coalesce(p.full_name, '')),
                                   length(split_part(btrim(coalesce(p.full_name, '')), ' ', 1)) + 1)), ''),
               coalesce(nullif(p.timezone, ''), 'UTC'),
               true, true, true
        from public.profiles p
        where p.id = ${userId}::uuid
      `;
            return (await select())[0] ?? null;
        });
    }
    async create(parentUserId, input) {
        return this.prisma.withUser(parentUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        insert into public.students (
          parent_id, first_name, last_name, date_of_birth, gender,
          curriculum_id, education_level_id, school_name, learning_goals,
          special_needs, timezone, avatar_url,
          can_self_login, can_book_lessons, can_message_tutors
        ) values (
          ${parentUserId}::uuid, ${input.firstName}, ${input.lastName ?? null},
          ${input.dateOfBirth ?? null}::date, ${input.gender ?? null},
          ${input.curriculumId ?? null}::uuid, ${input.educationLevelId ?? null}::uuid,
          ${input.schoolName ?? null}, ${input.learningGoals ?? null},
          ${input.specialNeeds ?? null}, ${input.timezone ?? 'UTC'},
          ${input.avatarUrl ?? null},
          ${input.canSelfLogin ?? false}, ${input.canBookLessons ?? false},
          ${input.canMessageTutors ?? false}
        )
        returning id, profile_id, parent_id, first_name, last_name, date_of_birth, gender,
                  curriculum_id, education_level_id, school_name, learning_goals,
                  special_needs, timezone, avatar_url, can_self_login, can_book_lessons,
                  can_message_tutors, is_active, created_at
      `;
            return rows[0];
        });
    }
    async update(userId, id, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.students set
          first_name         = coalesce(${input.firstName ?? null}, first_name),
          last_name          = coalesce(${input.lastName ?? null}, last_name),
          date_of_birth      = coalesce(${input.dateOfBirth ?? null}::date, date_of_birth),
          gender             = coalesce(${input.gender ?? null}, gender),
          curriculum_id      = coalesce(${input.curriculumId ?? null}::uuid, curriculum_id),
          education_level_id = coalesce(${input.educationLevelId ?? null}::uuid, education_level_id),
          school_name        = coalesce(${input.schoolName ?? null}, school_name),
          learning_goals     = coalesce(${input.learningGoals ?? null}, learning_goals),
          special_needs      = coalesce(${input.specialNeeds ?? null}, special_needs),
          timezone           = coalesce(${input.timezone ?? null}, timezone),
          avatar_url         = coalesce(${input.avatarUrl ?? null}, avatar_url),
          can_self_login     = coalesce(${input.canSelfLogin ?? null}, can_self_login),
          can_book_lessons   = coalesce(${input.canBookLessons ?? null}, can_book_lessons),
          can_message_tutors = coalesce(${input.canMessageTutors ?? null}, can_message_tutors),
          updated_at         = now()
        where id = ${id}::uuid
          -- students_parent_update, applied here (no row-level security on this connection).
          and (parent_id = auth.uid() or profile_id = auth.uid() or public.is_admin())
        returning id, profile_id, parent_id, first_name, last_name, date_of_birth, gender,
                  curriculum_id, education_level_id, school_name, learning_goals,
                  special_needs, timezone, avatar_url, can_self_login, can_book_lessons,
                  can_message_tutors, is_active, created_at
      `;
            return rows[0] ?? null;
        });
    }
    async deactivate(userId, id) {
        const affected = await this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        update public.students set is_active = false, updated_at = now()
        where id = ${id}::uuid and is_active
          and (parent_id = auth.uid() or public.is_admin())
      `);
        return affected > 0;
    }
    async progress(userId, studentId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select * from public.parent_child_progress(${studentId}::uuid)
      `);
    }
};
exports.StudentsRepository = StudentsRepository;
exports.StudentsRepository = StudentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsRepository);
//# sourceMappingURL=students.repository.js.map