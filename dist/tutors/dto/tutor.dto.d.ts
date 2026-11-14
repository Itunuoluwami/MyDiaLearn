import { PaginationQueryDto } from '../../shared/query.dto';
export declare class UpdateTutorProfileDto {
    headline?: string;
    biography?: string;
    qualifications?: string[];
    languages?: string[];
    education?: string[];
    yearsExperience?: number;
    introVideoUrl?: string;
    timezone?: string;
    methodology?: string;
    teachingContext?: string;
    onboardingStep?: number;
    isListed?: boolean;
}
export declare class TutorSubjectEntryDto {
    subjectId: string;
    educationLevelId?: string;
}
export declare class AddTutorSubjectDto {
    subjectId: string;
    educationLevelId?: string;
}
export declare class SetWindowActiveDto {
    isActive: boolean;
}
export declare class AddAvailabilityWindowDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export declare class ReplaceTutorSubjectsDto {
    subjects: TutorSubjectEntryDto[];
}
export declare class AvailabilityWindowDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    isActive?: boolean;
}
export declare class ReplaceAvailabilityDto {
    windows: AvailabilityWindowDto[];
}
export declare class AddTutorDocumentDto {
    stepId?: string;
    label: string;
    storagePath: string;
    mimeType?: string;
    sizeBytes?: number;
}
export declare class TutorListQueryDto extends PaginationQueryDto {
}
export interface TutorProfileResponse {
    id: string;
    profileId: string;
    agencyId: string | null;
    headline: string | null;
    biography: string | null;
    qualifications: string[];
    languages: string[];
    education: string[];
    hourlyRate: string | null;
    currency: string;
    yearsExperience: number | null;
    introVideoUrl: string | null;
    timezone: string;
    verificationStatus: string;
    isListed: boolean;
    methodology: string | null;
    teachingContext: string | null;
    onboardingStep: number;
    submittedAt: string | null;
}
export interface TutorSubjectResponse {
    id: string;
    subjectId: string;
    subjectName: string | null;
    educationLevelId: string | null;
    levelName: string | null;
}
export interface AvailabilityWindowResponse {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    isActive: boolean;
}
export interface VerificationStepResponse {
    id: string;
    name: string;
    code: string;
    description: string | null;
    isRequired: boolean;
    sortOrder: number;
    status: string | null;
    reviewerNotes: string | null;
    reviewedAt: string | null;
}
export interface TutorDocumentResponse {
    id: string;
    stepId: string | null;
    label: string;
    mimeType: string | null;
    sizeBytes: number | null;
    status: string;
    reviewerNotes: string | null;
    reviewedAt: string | null;
    createdAt: string;
}
