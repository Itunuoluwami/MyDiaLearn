import { PaginationQueryDto } from '../../shared/query.dto';
export declare class CreateStudentDto {
    firstName: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    curriculumId?: string;
    educationLevelId?: string;
    schoolName?: string;
    learningGoals?: string;
    specialNeeds?: string;
    timezone?: string;
    avatarUrl?: string;
    canSelfLogin?: boolean;
    canBookLessons?: boolean;
    canMessageTutors?: boolean;
}
declare const UpdateStudentDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateStudentDto>>;
export declare class UpdateStudentDto extends UpdateStudentDto_base {
}
export declare class ListStudentsQueryDto extends PaginationQueryDto {
}
export interface StudentResponse {
    id: string;
    profileId: string | null;
    parentId: string | null;
    firstName: string;
    lastName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    curriculumId: string | null;
    curriculumName: string | null;
    educationLevelId: string | null;
    educationLevelName: string | null;
    schoolName: string | null;
    learningGoals: string | null;
    specialNeeds: string | null;
    timezone: string;
    avatarUrl: string | null;
    canSelfLogin: boolean;
    canBookLessons: boolean;
    canMessageTutors: boolean;
    isActive: boolean;
    createdAt: string;
}
export {};
