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
exports.TeachingRepository = exports.RESOURCE_VISIBLE = exports.ASSIGNMENT_VISIBLE = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const app_exception_1 = require("../common/exceptions/app.exception");
exports.ASSIGNMENT_VISIBLE = client_1.Prisma.sql `(
  public.owns_tutor(tutor_id)
  or (status <> 'draft' and public.can_access_student(student_id))
  or public.is_admin()
)`;
exports.RESOURCE_VISIBLE = client_1.Prisma.sql `(
  public.owns_tutor(tutor_id)
  or (is_shared and student_id is not null and public.can_access_student(student_id))
  or public.is_admin()
)`;
let TeachingRepository = class TeachingRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async lessonNotesForBooking(userId, bookingId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select id, booking_id, tutor_id, covered, understanding, improvements,
               next_steps, created_at, updated_at
        from public.lesson_notes where booking_id = ${bookingId}::uuid
          -- The three SELECT policies on lesson_notes, applied here: the API's
          -- connection owns the table, so row-level security does not.
          and (public.owns_tutor(tutor_id) or public.can_access_booking(booking_id)
               or public.is_admin())
        order by created_at desc
      `);
    }
    async upsertLessonNote(tutorUserId, input) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const own = await tx.$queryRaw `
        select exists (
          select 1 from public.bookings
          where id = ${input.bookingId}::uuid and tutor_id = public.current_tutor_id()
        ) as ok
      `;
            if (!own[0]?.ok)
                throw new app_exception_1.NotAuthorizedError('You can only write notes for your own lessons.');
            const existing = await tx.$queryRaw `
        select id from public.lesson_notes where booking_id = ${input.bookingId}::uuid limit 1
      `;
            if (existing[0]) {
                const rows = await tx.$queryRaw `
          update public.lesson_notes set
            covered       = coalesce(${input.covered ?? null}, covered),
            understanding = coalesce(${input.understanding ?? null}, understanding),
            improvements  = coalesce(${input.improvements ?? null}, improvements),
            next_steps    = coalesce(${input.nextSteps ?? null}, next_steps),
            updated_at    = now()
          where id = ${existing[0].id}::uuid and public.owns_tutor(tutor_id)
          returning id, booking_id, tutor_id, covered, understanding, improvements,
                    next_steps, created_at, updated_at
        `;
                return rows[0];
            }
            const rows = await tx.$queryRaw `
        insert into public.lesson_notes (booking_id, tutor_id, covered, understanding, improvements, next_steps)
        values (
          ${input.bookingId}::uuid, public.current_tutor_id(),
          ${input.covered ?? null}, ${input.understanding ?? null},
          ${input.improvements ?? null}, ${input.nextSteps ?? null}
        )
        returning id, booking_id, tutor_id, covered, understanding, improvements,
                  next_steps, created_at, updated_at
      `;
            return rows[0];
        });
    }
    async listAssignments(userId, query, filters) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, tutor_id, student_id, booking_id, subject_id, title, instructions,
               submission_requirements, due_at, resource_id, status::text, assigned_at,
               submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at,
               (select tp.full_name from public.tutors t join public.profiles tp on tp.id = t.profile_id
                 where t.id = assignments.tutor_id) as tutor_name,
               (select name from public.subjects where id = assignments.subject_id) as subject_name,
               (select first_name from public.students where id = assignments.student_id) as student_first_name,
               (select avatar_url from public.students where id = assignments.student_id) as student_avatar_url,
               (select title from public.learning_resources where id = assignments.resource_id) as resource_title
        from public.assignments
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          -- The SELECT policies on assignments, applied here: the API's
          -- connection owns the table, so row-level security does not.
          and ${exports.ASSIGNMENT_VISIBLE}
        order by coalesce(due_at, created_at) desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.assignments
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.status ?? null}::text is null or status::text = ${filters.status ?? null})
          and ${exports.ASSIGNMENT_VISIBLE}
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async findAssignment(userId, id) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, tutor_id, student_id, booking_id, subject_id, title, instructions,
               submission_requirements, due_at, resource_id, status::text, assigned_at,
               submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
        from public.assignments where id = ${id}::uuid and ${exports.ASSIGNMENT_VISIBLE}
      `;
            return rows[0] ?? null;
        });
    }
    async assignmentRecipient(assignmentId) {
        const rows = await this.prisma.$queryRaw `
      select sp.email      as student_email,
             tp.full_name  as tutor_name,
             a.title,
             a.due_at
      from public.assignments a
      join public.students s       on s.id = a.student_id
      left join public.profiles sp on sp.id = s.profile_id
      join public.tutors t         on t.id = a.tutor_id
      join public.profiles tp      on tp.id = t.profile_id
      where a.id = ${assignmentId}::uuid
      limit 1
    `;
        return rows[0] ?? null;
    }
    async createAssignment(tutorUserId, input) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const assignNow = input.assignNow ?? true;
            const rows = await tx.$queryRaw `
        insert into public.assignments
          (tutor_id, student_id, booking_id, subject_id, title, instructions,
           submission_requirements, due_at, resource_id, status, assigned_at)
        values (
          public.current_tutor_id(), ${input.studentId}::uuid, ${input.bookingId ?? null}::uuid,
          ${input.subjectId ?? null}::uuid, ${input.title}, ${input.instructions ?? null},
          ${input.submissionRequirements ?? null}, ${input.dueAt ?? null}::timestamptz,
          ${input.resourceId ?? null}::uuid,
          (case when ${assignNow} then 'assigned' else 'draft' end)::public.assignment_status,
          case when ${assignNow} then now() end
        )
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
            return rows[0];
        });
    }
    async submitAssignment(userId, id, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.assignments set
          submission_text = ${input.submissionText ?? null},
          submission_path = ${input.submissionPath ?? null},
          submitted_at    = now(),
          status          = 'submitted',
          updated_at      = now()
        -- The "Families submit" policy, applied here: the API's connection
        -- bypasses row-level security.
        where id = ${id}::uuid
          and status in ('assigned', 'submitted')
          and public.can_access_student(student_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
            return rows[0] ?? null;
        });
    }
    async reviewAssignment(tutorUserId, id, feedback) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.assignments set
          feedback = ${feedback}::text, reviewed_at = now(), status = 'reviewed', updated_at = now()
        where id = ${id}::uuid and public.owns_tutor(tutor_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
            return rows[0] ?? null;
        });
    }
    async assignDraft(tutorUserId, id) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        update public.assignments set
          status = 'assigned', assigned_at = now(), updated_at = now()
        where id = ${id}::uuid and status = 'draft' and public.owns_tutor(tutor_id)
        returning id, tutor_id, student_id, booking_id, subject_id, title, instructions,
                  submission_requirements, due_at, resource_id, status::text, assigned_at,
                  submission_text, submission_path, submitted_at, feedback, reviewed_at, created_at
      `;
            return rows[0] ?? null;
        });
    }
    async listResources(userId, query, filters) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, tutor_id, title, description, resource_type::text, storage_path,
               external_url, subject_id, student_id, mime_type, size_bytes, is_shared, created_at,
               (select tp.full_name from public.tutors t join public.profiles tp on tp.id = t.profile_id
                 where t.id = learning_resources.tutor_id) as tutor_name,
               (select name from public.subjects where id = learning_resources.subject_id) as subject_name,
               (select first_name from public.students where id = learning_resources.student_id) as student_first_name
        from public.learning_resources
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.subjectId ?? null}::uuid is null or subject_id = ${filters.subjectId ?? null}::uuid)
          -- The SELECT policies on learning_resources, applied here.
          and ${exports.RESOURCE_VISIBLE}
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.learning_resources
        where (${filters.studentId ?? null}::uuid is null or student_id = ${filters.studentId ?? null}::uuid)
          and (${filters.subjectId ?? null}::uuid is null or subject_id = ${filters.subjectId ?? null}::uuid)
          and ${exports.RESOURCE_VISIBLE}
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async createResource(tutorUserId, input) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            if (input.storagePath) {
                const owned = await tx.$queryRaw `
          select coalesce(starts_with(${input.storagePath}, public.current_tutor_id()::text || '/'), false)
                 and position('..' in ${input.storagePath}) = 0 as ok
        `;
                if (!owned[0]?.ok)
                    throw new app_exception_1.NotAuthorizedError('That file does not belong to you.');
            }
            const rows = await tx.$queryRaw `
        insert into public.learning_resources
          (tutor_id, title, description, resource_type, storage_path, external_url,
           subject_id, student_id, mime_type, size_bytes, is_shared)
        values (
          public.current_tutor_id(), ${input.title}, ${input.description ?? null},
          ${input.resourceType}::public.resource_type, ${input.storagePath ?? null},
          ${input.externalUrl ?? null}, ${input.subjectId ?? null}::uuid,
          ${input.studentId ?? null}::uuid, ${input.mimeType ?? null},
          ${input.sizeBytes ?? null}, ${input.isShared ?? false}
        )
        returning id, tutor_id, title, description, resource_type::text, storage_path,
                  external_url, subject_id, student_id, mime_type, size_bytes, is_shared, created_at
      `;
            return rows[0];
        });
    }
    async deleteResource(tutorUserId, id) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        delete from public.learning_resources
        where id = ${id}::uuid and public.owns_tutor(tutor_id)
        returning storage_path
      `;
            return rows.length ? (rows[0].storage_path ?? '') : null;
        });
    }
};
exports.TeachingRepository = TeachingRepository;
exports.TeachingRepository = TeachingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachingRepository);
//# sourceMappingURL=teaching.repository.js.map