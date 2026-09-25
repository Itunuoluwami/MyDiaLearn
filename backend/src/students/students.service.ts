import { Injectable } from '@nestjs/common';

import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { NotFoundError } from '../common/exceptions/app.exception';
import { paginate, type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { CreateStudentDto, StudentResponse, UpdateStudentDto } from './dto/student.dto';
import { StudentsRepository, type StudentRow } from './students.repository';

/**
 * Learners.
 *
 * Access is decided by can_access_student() through the students_read policy —
 * the learner, their parent, and tutors they have booked. Rather than
 * re-deriving that here, every read runs inside the caller's claims and an
 * invisible row is reported as missing, which is the correct answer to give.
 */
@Injectable()
export class StudentsService {
  constructor(
    private readonly repository: StudentsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(userId: string, query: PaginationQueryDto): Promise<Paginated<StudentResponse>> {
    const { rows, total } = await this.repository.list(userId, query);
    return paginate(rows.map(toResponse), total, query);
  }

  async findOne(userId: string, id: string): Promise<StudentResponse> {
    const row = await this.repository.findById(userId, id);
    if (!row) throw new NotFoundError('Student');
    return toResponse(row);
  }

  async create(
    parentUserId: string,
    dto: CreateStudentDto,
    context: AuditContext,
  ): Promise<StudentResponse> {
    const row = await this.repository.create(parentUserId, dto);

    await this.audit.record('user.profile_updated', {
      actorId: parentUserId,
      entityType: 'student',
      entityId: row.id,
      context,
      // Identifiers and capability flags only — a child's name, school and
      // special needs are exactly the data an audit trail should not copy.
      metadata: {
        scope: 'student_created',
        canSelfLogin: row.can_self_login,
        canBookLessons: row.can_book_lessons,
        canMessageTutors: row.can_message_tutors,
      },
    });

    return toResponse(row);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateStudentDto,
    context: AuditContext,
  ): Promise<StudentResponse> {
    const row = await this.repository.update(userId, id, dto);
    if (!row) throw new NotFoundError('Student');

    await this.audit.record('user.profile_updated', {
      actorId: userId,
      entityType: 'student',
      entityId: id,
      context,
      metadata: { scope: 'student_updated', fields: Object.keys(dto) },
    });

    return toResponse(row);
  }

  async deactivate(userId: string, id: string, context: AuditContext): Promise<void> {
    const ok = await this.repository.deactivate(userId, id);
    if (!ok) throw new NotFoundError('Student');

    await this.audit.record('user.profile_updated', {
      actorId: userId,
      entityType: 'student',
      entityId: id,
      context,
      metadata: { scope: 'student_deactivated' },
    });
  }

  async progress(userId: string, studentId: string): Promise<Record<string, unknown>[]> {
    // Reads inside the caller's claims, so parent_child_progress() applies
    // can_access_student() to the right person.
    return this.repository.progress(userId, studentId);
  }
}

export function toResponse(row: StudentRow): StudentResponse {
  return {
    id: row.id,
    profileId: row.profile_id,
    parentId: row.parent_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : null,
    gender: row.gender,
    curriculumId: row.curriculum_id,
    curriculumName: row.curriculum_name ?? null,
    educationLevelId: row.education_level_id,
    educationLevelName: row.education_level_name ?? null,
    schoolName: row.school_name,
    learningGoals: row.learning_goals,
    specialNeeds: row.special_needs,
    timezone: row.timezone,
    avatarUrl: row.avatar_url,
    canSelfLogin: row.can_self_login,
    canBookLessons: row.can_book_lessons,
    canMessageTutors: row.can_message_tutors,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
  };
}
