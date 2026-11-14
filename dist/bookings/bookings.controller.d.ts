import type { Request } from 'express';
import { type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import type { Paginated } from '../shared/query.dto';
import { BookingsService } from './bookings.service';
import { AvailableSlotsQueryDto, CreateBookingDto, EndClassDto, FamilyCancelDto, ListBookingsQueryDto, RaiseDisputeDto, RateBookingDto, RespondBookingDto, TutorScheduleQueryDto, type AvailableSlotResponse, type BookingResponse } from './dto/booking.dto';
export declare class BookingsController {
    private readonly bookings;
    constructor(bookings: BookingsService);
    availableSlots(user: AuthenticatedUser, query: AvailableSlotsQueryDto): Promise<AvailableSlotResponse[]>;
    tutorSchedule(user: AuthenticatedUser, query: TutorScheduleQueryDto): Promise<Record<string, unknown>[]>;
    create(user: AuthenticatedUser, dto: CreateBookingDto, request: Request): Promise<BookingResponse>;
    list(user: AuthenticatedUser, query: ListBookingsQueryDto): Promise<Paginated<BookingResponse>>;
    myRatings(user: AuthenticatedUser): Promise<Record<string, unknown>[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<BookingResponse>;
    respond(user: AuthenticatedUser, id: string, dto: RespondBookingDto, request: Request): Promise<{
        status: string;
    }>;
    rate(user: AuthenticatedUser, id: string, dto: RateBookingDto): Promise<void>;
    cancelByFamily(user: AuthenticatedUser, id: string, dto: FamilyCancelDto, request: Request): Promise<void>;
    raiseDispute(user: AuthenticatedUser, id: string, dto: RaiseDisputeDto, request: Request): Promise<{
        id: string;
    }>;
    openClass(user: AuthenticatedUser, id: string): Promise<Record<string, unknown>>;
    joinClass(user: AuthenticatedUser, id: string): Promise<Record<string, unknown>>;
    startClass(user: AuthenticatedUser, id: string, request: Request): Promise<void>;
    endClass(user: AuthenticatedUser, id: string, dto: EndClassDto, request: Request): Promise<void>;
}
