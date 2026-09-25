import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';

export interface StudentRow {
  id: string;
  profile_id: string | null;
  parent_id: string | null;
  curriculum_name?: string | null;
  education_level_name?: string | null;
  first_name: string;
  last_name: string | null;
  date_of_birth: Date | null;
  gender: string | null;
  curriculum_id: string | null;
  education_level_id: string | null;
  school_name: string | null;
  learning_goals: string | null;
  special_needs: string | null;
  timezone: string;
  avatar_url: string | null;
  can_self_login: boolean;
  can_book_lessons: boolean;
  can_message_tutors: boolean;
  is_active: boolean;
  created_at: Date;
}

export interface StudentInput {
  firstName: string;
  lastName?: string | undefined;
  dateOfBirth?: string | undefined;
  gender?: string | undefined;
  curriculumId?: string | undefined;
  educationLevelId?: string | undefined;
  schoolName?: string | undefined;
  learningGoals?: string | undefined;
  specialNeeds?: string | undefined;
  timezone?: string | undefined;
  avatarUrl?: string | undefined;
  canSelfLogin?: boolean | undefined;
  canBookLessons?: boolean | undefined;
  canMessageTutors?: boolean | undefined;
}

const STUDENT_COLUMNS = `
  id, profile_id, parent_id, first_name, last_name, date_of_birth, gender,
  curriculum_id, education_level_id, school_name, learning_goals, special_needs,
  timezone, avatar_url, can_self_login, can_book_lessons, can_message_tutors,
  is_active, created_at
`;

/**
 * Learners.
 *
 * A student is not necessarily an account. A parent-managed learner may have no
 * login at all, which is why `profile_id` is nullable and a student id and a
 * profile id are never interchangeable. The `can_*` flags are what a parent
 * uses to decide how much autonomy a child has.
 *
 * Visibility is governed by can_access_student() through the students_read
 * policy: the learner themselves, their parent, and tutors they have booked.
 * Every query here runs inside the caller's claims so that applies.
 */
@Injectable()
export class StudentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ rows: StudentRow[]; total: number }> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRawUnsafe<StudentRow[]>(
        `select s.id, s.profile_id, s.parent_id, s.first_name, s.last_name,
                s.date_of_birth, s.gender, s.curriculum_id, s.education_level_id,
                s.school_name, s.learning_goals, s.special_needs, s.timezone,
                s.avatar_url, s.can_self_login, s.can_book_lessons,
                s.can_message_tutors, s.is_active, s.created_at,
                cur.name as curriculum_name, el.name as education_level_name
         from public.students s
         left join public.curricula cur on cur.id = s.curriculum_id
         left join public.education_levels el on el.id = s.education_level_id
         order by s.is_active desc, s.first_name
         limit $1 offset $2`,
        query.limit,
        query.skip,
      );
      const counted = await tx.$queryRaw<{ n: bigint }[]>`
        select count(*)::bigint n from public.students
      `;
      return { rows, total: Number(counted[0]?.n ?? 0) };
    });
  }

  async findById(userId: string, id: string): Promise<StudentRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRawUnsafe<StudentRow[]>(
        `select ${STUDENT_COLUMNS} from public.students where id = $1::uuid`,
        id,
      );
      return rows[0] ?? null;
    });
  }

  /**
   * Creates a learner owned by the caller.
   *
   * `parent_id` is taken from the caller, never from the request. Accepting it
   * would let anyone attach a child to someone else's account; the
   * students_parent_insert policy would refuse, but the API should not be
   * shaped to invite the attempt.
   */
  async create(parentUserId: string, input: StudentInput): Promise<StudentRow> {
    return this.prisma.withUser(parentUserId, async (tx) => {
      const rows = await tx.$queryRaw<StudentRow[]>`
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
      return rows[0]!;
    });
  }

  async update(
    userId: string,
    id: string,
    input: Partial<StudentInput>,
  ): Promise<StudentRow | null> {
    return this.prisma.withUser(userId, async (tx) => {
      const rows = await tx.$queryRaw<StudentRow[]>`
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
        returning id, profile_id, parent_id, first_name, last_name, date_of_birth, gender,
                  curriculum_id, education_level_id, school_name, learning_goals,
                  special_needs, timezone, avatar_url, can_self_login, can_book_lessons,
                  can_message_tutors, is_active, created_at
      `;
      return rows[0] ?? null;
    });
  }

  /**
   * Deactivates rather than deletes.
   *
   * A learner is referenced by bookings, payments, ratings and lesson notes. A
   * hard delete would either fail on those references or cascade through a
   * family's history. Deactivation is what the portal actually means by
   * "remove".
   */
  async deactivate(userId: string, id: string): Promise<boolean> {
    const affected = await this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$executeRaw`
        update public.students set is_active = false, updated_at = now()
        where id = ${id}::uuid and is_active
      `,
    );
    return affected > 0;
  }

  /** Progress by subject, via parent_child_progress(). */
  async progress(userId: string, studentId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.withUser(
      userId,
      async (tx) =>
        tx.$queryRaw<Record<string, unknown>[]>`
        select * from public.parent_child_progress(${studentId}::uuid)
      `,
    );
  }
}
