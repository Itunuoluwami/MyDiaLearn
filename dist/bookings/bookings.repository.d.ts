import { PrismaService } from '../database/prisma.service';
import { BaseRepository } from '../database/repositories/base.repository';
import type { PaginationQueryDto } from '../shared/query.dto';
export interface BookingRow {
    id: string;
    subject_name?: string | null;
    paid?: boolean;
    session_meeting_url?: string | null;
    session_status?: string | null;
    session_id?: string | null;
    session_tutor_notes?: string | null;
    session_homework?: string | null;
    tutor_name?: string | null;
    tutor_avatar_url?: string | null;
    student_id: string;
    tutor_id: string;
    booked_by: string;
    subject_id: string | null;
    education_level_id: string | null;
    starts_at: Date;
    ends_at: Date;
    duration_minutes: number;
    booking_timezone: string;
    hourly_rate: string;
    currency: string;
    total_amount: string;
    status: string;
    student_notes: string | null;
    tutor_accepted_at: Date | null;
    cancelled_at: Date | null;
    cancellation_reason: string | null;
    created_at: Date;
}
export interface BookingNotificationContext {
    id: string;
    starts_at: Date;
    booking_timezone: string;
    tutor_timezone: string;
    total_amount: string;
    currency: string;
    subject_name: string | null;
    tutor_user_id: string;
    tutor_name: string | null;
    tutor_email: string | null;
    student_name: string;
    student_user_id: string | null;
    student_email: string | null;
    booker_user_id: string;
    booker_name: string | null;
    booker_email: string | null;
}
export interface AvailableSlot {
    starts_at: Date;
    ends_at: Date;
}
export interface CreateBookingInput {
    studentId: string;
    tutorId: string;
    subjectId?: string | undefined;
    educationLevelId?: string | undefined;
    startsAt: Date;
    durationMinutes: number;
    timezone: string;
    studentNotes?: string | undefined;
    hourlyRate: string;
    currency: string;
    totalAmount: string;
    commissionRuleId: string | null;
}
export declare class BookingsRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    createWithQuote(callerId: string, input: Omit<CreateBookingInput, 'hourlyRate' | 'currency' | 'totalAmount' | 'commissionRuleId'>): Promise<BookingRow>;
    notificationContext(bookingId: string): Promise<BookingNotificationContext | null>;
    list(userId: string, query: PaginationQueryDto, filters: {
        status?: string | undefined;
        from?: Date | undefined;
        to?: Date | undefined;
    }): Promise<{
        rows: BookingRow[];
        total: number;
    }>;
    findById(userId: string, id: string): Promise<BookingRow | null>;
    availableSlots(callerId: string, input: {
        tutorId: string;
        from: Date;
        days: number;
        durationMinutes: number;
    }): Promise<AvailableSlot[]>;
    rate(userId: string, bookingId: string, input: {
        score: number;
        comment?: string | undefined;
    }): Promise<'rated' | 'not_found' | 'not_completed'>;
    respond(tutorUserId: string, bookingId: string, accept: boolean): Promise<string>;
    tutorSchedule(tutorUserId: string, input: {
        from?: Date | undefined;
        to?: Date | undefined;
        statuses?: string[] | undefined;
    }): Promise<Record<string, unknown>[]>;
    openClass(tutorUserId: string, bookingId: string): Promise<Record<string, unknown> | null>;
    joinClass(userId: string, bookingId: string): Promise<Record<string, unknown> | null>;
    setMeetingRoom(bookingId: string, meetingUrl: string, provider: string): Promise<void>;
    startClass(tutorUserId: string, bookingId: string): Promise<void>;
    endClass(tutorUserId: string, bookingId: string, studentAttended: boolean | undefined): Promise<void>;
    raiseDispute(userId: string, bookingId: string, input: {
        category: string;
        description: string;
    }): Promise<string>;
    myRatings(userId: string): Promise<Record<string, unknown>[]>;
    cancelByFamily(userId: string, bookingId: string, reason: string): Promise<'cancelled' | 'not_found' | 'not_cancellable'>;
}
