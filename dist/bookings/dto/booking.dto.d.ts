import { PaginationQueryDto } from '../../shared/query.dto';
export declare const BOOKING_STATUSES: readonly ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"];
export declare class CreateBookingDto {
    studentId: string;
    tutorId: string;
    subjectId?: string;
    educationLevelId?: string;
    startsAt: string;
    durationMinutes: number;
    timezone: string;
    studentNotes?: string;
}
export declare class RespondBookingDto {
    accept: boolean;
}
export declare class RateBookingDto {
    score: number;
    comment?: string;
}
export declare const DISPUTE_CATEGORIES: readonly ["payment", "conduct", "quality", "scheduling", "other"];
export declare class RaiseDisputeDto {
    category: (typeof DISPUTE_CATEGORIES)[number];
    description: string;
}
export declare class FamilyCancelDto {
    reason?: string;
}
export declare class EndClassDto {
    studentAttended?: boolean;
}
export declare class AvailableSlotsQueryDto {
    tutorId: string;
    from?: string;
    days: number;
    durationMinutes: number;
}
export declare class ListBookingsQueryDto extends PaginationQueryDto {
    status?: (typeof BOOKING_STATUSES)[number];
    from?: string;
    to?: string;
}
export declare class TutorScheduleQueryDto {
    statuses?: (typeof BOOKING_STATUSES)[number][];
    from?: string;
    to?: string;
}
export interface BookingResponse {
    id: string;
    studentId: string;
    tutorId: string;
    bookedBy: string;
    subjectId: string | null;
    educationLevelId: string | null;
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    timezone: string;
    hourlyRate: string;
    currency: string;
    totalAmount: string;
    status: string;
    subjectName: string | null;
    paid: boolean;
    sessionMeetingUrl: string | null;
    sessionStatus: string | null;
    sessionId: string | null;
    sessionTutorNotes: string | null;
    sessionHomework: string | null;
    tutorName: string | null;
    tutorAvatarUrl: string | null;
    studentNotes: string | null;
    tutorAcceptedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
}
export interface AvailableSlotResponse {
    startsAt: string;
    endsAt: string;
}
