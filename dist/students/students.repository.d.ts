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
export declare class StudentsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    list(userId: string, query: PaginationQueryDto): Promise<{
        rows: StudentRow[];
        total: number;
    }>;
    findById(userId: string, id: string): Promise<StudentRow | null>;
    findOrCreateOwn(userId: string, create: boolean): Promise<StudentRow | null>;
    create(parentUserId: string, input: StudentInput): Promise<StudentRow>;
    update(userId: string, id: string, input: Partial<StudentInput>): Promise<StudentRow | null>;
    deactivate(userId: string, id: string): Promise<boolean>;
    progress(userId: string, studentId: string): Promise<Record<string, unknown>[]>;
}
