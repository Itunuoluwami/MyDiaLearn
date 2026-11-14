import type { Request } from 'express';
import type { IncomingFile } from '../files/files.service';
import { AddTutorDocumentDto } from '../tutors/dto/tutor.dto';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AddAvailabilityWindowDto, AddTutorSubjectDto, SetWindowActiveDto, UpdateTutorProfileDto } from '../tutors/dto/tutor.dto';
import { AgenciesService } from './agencies.service';
import { AddAgencyTutorDto, AgencyBookingsQueryDto, AgencyPayoutDto, UpdateAgencyDto } from './dto/agency.dto';
type Row = Record<string, unknown>;
export declare class AgenciesController {
    private readonly agencies;
    constructor(agencies: AgenciesService);
    me(user: AuthenticatedUser): Promise<Row>;
    update(user: AuthenticatedUser, dto: UpdateAgencyDto): Promise<Row>;
    submit(user: AuthenticatedUser, request: Request): Promise<{
        status: string;
    }>;
    dashboard(user: AuthenticatedUser): Promise<Row>;
    roster(user: AuthenticatedUser): Promise<Row[]>;
    addTutor(user: AuthenticatedUser, dto: AddAgencyTutorDto, request: Request): Promise<{
        tutorId: string;
        emailed: boolean;
    }>;
    removeTutor(user: AuthenticatedUser, tutorId: string, request: Request): Promise<void>;
    tutorProfile(user: AuthenticatedUser, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorProfileResponse>;
    updateTutorProfile(user: AuthenticatedUser, tutorId: string, dto: UpdateTutorProfileDto, request: Request): Promise<import("../tutors/dto/tutor.dto").TutorProfileResponse>;
    tutorSubjects(user: AuthenticatedUser, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorSubjectResponse[]>;
    addTutorSubject(user: AuthenticatedUser, tutorId: string, dto: AddTutorSubjectDto, request: Request): Promise<import("../tutors/dto/tutor.dto").TutorSubjectResponse>;
    removeTutorSubject(user: AuthenticatedUser, tutorId: string, id: string, request: Request): Promise<void>;
    tutorAvailability(user: AuthenticatedUser, tutorId: string): Promise<import("../tutors/dto/tutor.dto").AvailabilityWindowResponse[]>;
    addTutorWindow(user: AuthenticatedUser, tutorId: string, dto: AddAvailabilityWindowDto, request: Request): Promise<import("../tutors/dto/tutor.dto").AvailabilityWindowResponse>;
    setTutorWindowActive(user: AuthenticatedUser, tutorId: string, id: string, dto: SetWindowActiveDto, request: Request): Promise<void>;
    deleteTutorWindow(user: AuthenticatedUser, tutorId: string, id: string, request: Request): Promise<void>;
    tutorVerification(user: AuthenticatedUser, tutorId: string): Promise<import("../tutors/dto/tutor.dto").VerificationStepResponse[]>;
    submitTutorVerification(user: AuthenticatedUser, tutorId: string, request: Request): Promise<{
        status: string;
    }>;
    tutorDocuments(user: AuthenticatedUser, tutorId: string): Promise<import("../tutors/dto/tutor.dto").TutorDocumentResponse[]>;
    uploadTutorDocument(user: AuthenticatedUser, tutorId: string, file: IncomingFile | undefined, request: Request): Promise<import("../files/files.service").UploadedFileResponse>;
    addTutorDocument(user: AuthenticatedUser, tutorId: string, dto: AddTutorDocumentDto, request: Request): Promise<import("../tutors/dto/tutor.dto").TutorDocumentResponse>;
    removeTutorDocument(user: AuthenticatedUser, tutorId: string, documentId: string, request: Request): Promise<void>;
    bookings(user: AuthenticatedUser, query: AgencyBookingsQueryDto): Promise<Row[]>;
    earnings(user: AuthenticatedUser): Promise<Row | null>;
    payouts(user: AuthenticatedUser): Promise<Row[]>;
    requestPayout(user: AuthenticatedUser, dto: AgencyPayoutDto, request: Request): Promise<{
        id: string;
    }>;
}
export {};
