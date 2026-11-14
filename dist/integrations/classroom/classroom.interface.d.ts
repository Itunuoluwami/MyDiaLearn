export interface ClassroomSession {
    joinUrl: string;
    provider: string;
    hostUrl?: string;
    expiresAt?: Date;
}
export interface CreateSessionRequest {
    bookingId: string;
    startsAt: Date;
    durationMinutes: number;
    hostName: string;
    subject?: string;
}
export interface ClassroomProvider {
    readonly name: string;
    isEnabled(): boolean;
    createSession(request: CreateSessionRequest): Promise<ClassroomSession>;
    endSession(bookingId: string): Promise<void>;
    getRecordingUrl(bookingId: string): Promise<string | null>;
}
export declare const CLASSROOM_PROVIDER: unique symbol;
