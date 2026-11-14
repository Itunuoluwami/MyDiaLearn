import type { AvailabilityWindowDto, AvailabilityWindowResponse } from '../dto/tutor.dto';
import { TutorAvailabilityRepository, type AvailabilityWindowRow } from '../tutor-availability.repository';
import { TutorsRepository } from '../tutors.repository';
export declare class TutorAvailabilityService {
    private readonly repository;
    private readonly tutors;
    constructor(repository: TutorAvailabilityRepository, tutors: TutorsRepository);
    listOwn(userId: string): Promise<AvailabilityWindowResponse[]>;
    listPublic(tutorId: string): Promise<AvailabilityWindowResponse[]>;
    addWindow(userId: string, input: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }): Promise<AvailabilityWindowResponse>;
    setWindowActive(userId: string, id: string, isActive: boolean): Promise<void>;
    deleteWindow(userId: string, id: string): Promise<void>;
    replaceOwn(userId: string, windows: AvailabilityWindowDto[]): Promise<AvailabilityWindowResponse[]>;
}
export declare function toResponse(row: AvailabilityWindowRow): AvailabilityWindowResponse;
