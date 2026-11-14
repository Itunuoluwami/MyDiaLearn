import { AuditService, type AuditContext } from '../common/audit/audit.service';
import { AppException } from '../common/exceptions/app.exception';
import { type ClassroomProvider } from '../integrations/classroom/classroom.interface';
import { NotificationDispatchService } from '../notifications/services/notification-dispatch.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { type Paginated, type PaginationQueryDto } from '../shared/query.dto';
import type { AvailableSlotResponse, BookingResponse, CreateBookingDto } from './dto/booking.dto';
import { BookingsRepository, type BookingRow } from './bookings.repository';
export declare class BookingsService {
    private readonly repository;
    private readonly settings;
    private readonly audit;
    private readonly notifications;
    private readonly classroom;
    constructor(repository: BookingsRepository, settings: PlatformSettingsService, audit: AuditService, notifications: NotificationDispatchService, classroom: ClassroomProvider);
    private static describe;
    private notifySafely;
    create(callerId: string, dto: CreateBookingDto, context: AuditContext): Promise<BookingResponse>;
    list(userId: string, query: PaginationQueryDto & {
        status?: string;
        from?: string;
        to?: string;
    }): Promise<Paginated<BookingResponse>>;
    findOne(userId: string, id: string): Promise<BookingResponse>;
    availableSlots(callerId: string, input: {
        tutorId: string;
        from?: string;
        days: number;
        durationMinutes: number;
    }): Promise<AvailableSlotResponse[]>;
    respond(tutorUserId: string, bookingId: string, accept: boolean, context: AuditContext): Promise<{
        status: string;
    }>;
    private announceConfirmed;
    rate(userId: string, bookingId: string, input: {
        score: number;
        comment?: string | undefined;
    }): Promise<void>;
    cancelByFamily(userId: string, bookingId: string, reason: string | undefined, context: AuditContext): Promise<void>;
    myRatings(userId: string): Promise<Record<string, unknown>[]>;
    raiseDispute(userId: string, bookingId: string, input: {
        category: string;
        description: string;
    }, context: AuditContext): Promise<{
        id: string;
    }>;
    tutorSchedule(tutorUserId: string, input: {
        from?: string;
        to?: string;
        statuses?: string[];
    }): Promise<Record<string, unknown>[]>;
    openClass(tutorUserId: string, bookingId: string): Promise<Record<string, unknown>>;
    joinClass(userId: string, bookingId: string): Promise<Record<string, unknown>>;
    startClass(tutorUserId: string, bookingId: string, context: AuditContext): Promise<void>;
    endClass(tutorUserId: string, bookingId: string, studentAttended: boolean | undefined, context: AuditContext): Promise<void>;
    private assertBookableWindow;
}
export declare function toResponse(row: BookingRow): BookingResponse;
export declare function translateBookingError(error: unknown): AppException;
