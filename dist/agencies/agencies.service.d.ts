import { AuthService } from '../auth/auth.service';
import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { TutorAvailabilityService } from '../tutors/services/tutor-availability.service';
import { TutorVerificationService } from '../tutors/services/tutor-verification.service';
import type { AddTutorDocumentDto } from '../tutors/dto/tutor.dto';
import { FilesService } from '../files/files.service';
import type { IncomingFile } from '../files/files.service';
import { TutorsService } from '../tutors/tutors.service';
import type { UpdateTutorProfileDto } from '../tutors/dto/tutor.dto';
import { AgenciesRepository } from './agencies.repository';
import type { UpdateAgencyDto } from './dto/agency.dto';
type Row = Record<string, unknown>;
export declare class AgenciesService {
    private readonly repository;
    private readonly auth;
    private readonly tutors;
    private readonly availability;
    private readonly verification;
    private readonly files;
    private readonly audit;
    constructor(repository: AgenciesRepository, auth: AuthService, tutors: TutorsService, availability: TutorAvailabilityService, verification: TutorVerificationService, files: FilesService, audit: AuditService);
    private ownAgency;
    me(ownerId: string): Promise<Row>;
    update(ownerId: string, dto: UpdateAgencyDto): Promise<Row>;
    submitVerification(ownerId: string, context: AuditContext): Promise<{
        status: string;
    }>;
    dashboard(ownerId: string): Promise<Row>;
    roster(ownerId: string): Promise<Row[]>;
    addTutor(ownerId: string, input: {
        fullName: string;
        email: string;
        timezone?: string | undefined;
    }, context: AuditContext): Promise<{
        tutorId: string;
        emailed: boolean;
    }>;
    removeTutor(ownerId: string, tutorId: string, context: AuditContext): Promise<void>;
    private asTutor;
    private managed;
    tutorProfile(ownerId: string, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorProfileResponse>;
    updateTutorProfile(ownerId: string, tutorId: string, dto: UpdateTutorProfileDto, context: AuditContext): Promise<import("../tutors/dto/tutor.dto").TutorProfileResponse>;
    tutorSubjects(ownerId: string, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorSubjectResponse[]>;
    addTutorSubject(ownerId: string, tutorId: string, subjectId: string, educationLevelId: string | undefined, context: AuditContext): Promise<import("../tutors/dto/tutor.dto").TutorSubjectResponse>;
    removeTutorSubject(ownerId: string, tutorId: string, id: string, context: AuditContext): Promise<void>;
    tutorAvailability(ownerId: string, tutorId: string): Promise<import("../tutors/dto/tutor.dto").AvailabilityWindowResponse[]>;
    addTutorWindow(ownerId: string, tutorId: string, input: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }, context: AuditContext): Promise<import("../tutors/dto/tutor.dto").AvailabilityWindowResponse>;
    setTutorWindowActive(ownerId: string, tutorId: string, id: string, isActive: boolean, context: AuditContext): Promise<void>;
    deleteTutorWindow(ownerId: string, tutorId: string, id: string, context: AuditContext): Promise<void>;
    tutorVerification(ownerId: string, tutorId: string): Promise<import("../tutors/dto/tutor.dto").VerificationStepResponse[]>;
    submitTutorVerification(ownerId: string, tutorId: string, context: AuditContext): Promise<{
        status: string;
    }>;
    tutorDocuments(ownerId: string, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorDocumentResponse[]>;
    uploadTutorDocument(ownerId: string, tutorId: string, file: IncomingFile | undefined, context: AuditContext): Promise<import("../files/files.service").UploadedFileResponse>;
    addTutorDocument(ownerId: string, tutorId: string, dto: AddTutorDocumentDto, context: AuditContext): Promise<import("../tutors/dto/tutor.dto").TutorDocumentResponse>;
    removeTutorDocument(ownerId: string, tutorId: string, documentId: string, context: AuditContext): Promise<void>;
    bookings(ownerId: string, query: {
        status?: string | undefined;
        from?: string | undefined;
        to?: string | undefined;
    }): Promise<Row[]>;
    earnings(ownerId: string): Promise<Row | null>;
    payouts(ownerId: string): Promise<Row[]>;
    requestPayout(ownerId: string, amount: number, context: AuditContext): Promise<{
        id: string;
    }>;
    private call;
}
export {};
