import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
export interface AvailabilityWindowRow {
    id: string;
    tutor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone: string;
    is_active: boolean;
}
export interface AvailabilityWindowInput {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    isActive?: boolean | undefined;
}
export declare class TutorAvailabilityRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    listPublic(tutorId: string): Promise<AvailabilityWindowRow[]>;
    list(userId: string, tutorId: string): Promise<AvailabilityWindowRow[]>;
    addAvailabilityWindow(userId: string, tutorId: string, input: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        timezone: string;
    }): Promise<AvailabilityWindowRow>;
    updateAvailabilityWindow(userId: string, id: string, isActive: boolean): Promise<boolean>;
    deleteAvailabilityWindow(userId: string, id: string): Promise<boolean>;
    replaceAll(userId: string, tutorId: string, windows: AvailabilityWindowInput[]): Promise<AvailabilityWindowRow[]>;
}
