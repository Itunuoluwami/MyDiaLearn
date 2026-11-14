import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AddAvailabilityWindowDto, AddTutorDocumentDto, AddTutorSubjectDto, SetWindowActiveDto, ReplaceAvailabilityDto, ReplaceTutorSubjectsDto, TutorListQueryDto, UpdateTutorProfileDto, type AvailabilityWindowResponse, type TutorDocumentResponse, type TutorProfileResponse, type TutorSubjectResponse, type VerificationStepResponse } from './dto/tutor.dto';
import { TutorAvailabilityService } from './services/tutor-availability.service';
import { TutorVerificationService } from './services/tutor-verification.service';
import { TutorsService } from './tutors.service';
export declare class TutorsController {
    private readonly tutors;
    private readonly availability;
    private readonly verification;
    constructor(tutors: TutorsService, availability: TutorAvailabilityService, verification: TutorVerificationService);
    me(user: AuthenticatedUser): Promise<TutorProfileResponse>;
    updateMe(user: AuthenticatedUser, dto: UpdateTutorProfileDto, request: Request): Promise<TutorProfileResponse>;
    dashboard(user: AuthenticatedUser): Promise<Record<string, unknown> | null>;
    subjects(user: AuthenticatedUser): Promise<TutorSubjectResponse[]>;
    addSubject(user: AuthenticatedUser, dto: AddTutorSubjectDto, request: Request): Promise<TutorSubjectResponse>;
    removeSubject(user: AuthenticatedUser, id: string): Promise<void>;
    replaceSubjects(user: AuthenticatedUser, dto: ReplaceTutorSubjectsDto, request: Request): Promise<TutorSubjectResponse[]>;
    availabilityOwn(user: AuthenticatedUser): Promise<AvailabilityWindowResponse[]>;
    addWindow(user: AuthenticatedUser, dto: AddAvailabilityWindowDto): Promise<AvailabilityWindowResponse>;
    setWindowActive(user: AuthenticatedUser, id: string, dto: SetWindowActiveDto): Promise<void>;
    deleteWindow(user: AuthenticatedUser, id: string): Promise<void>;
    replaceAvailability(user: AuthenticatedUser, dto: ReplaceAvailabilityDto): Promise<AvailabilityWindowResponse[]>;
    verificationSteps(user: AuthenticatedUser): Promise<VerificationStepResponse[]>;
    documents(user: AuthenticatedUser): Promise<TutorDocumentResponse[]>;
    addDocument(user: AuthenticatedUser, dto: AddTutorDocumentDto, request: Request): Promise<TutorDocumentResponse>;
    removeDocument(user: AuthenticatedUser, id: string, request: Request): Promise<void>;
    submitVerification(user: AuthenticatedUser, request: Request): Promise<{
        status: string;
    }>;
    students(user: AuthenticatedUser, query: TutorListQueryDto): Promise<Record<string, unknown>[]>;
    reviews(user: AuthenticatedUser, query: TutorListQueryDto): Promise<Record<string, unknown>[]>;
    ratingSummary(user: AuthenticatedUser): Promise<Record<string, unknown> | null>;
    ratingCategories(user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    availabilityFor(id: string): Promise<AvailabilityWindowResponse[]>;
}
