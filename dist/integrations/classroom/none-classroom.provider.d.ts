import type { ClassroomProvider, ClassroomSession, CreateSessionRequest } from './classroom.interface';
export declare class NoneClassroomProvider implements ClassroomProvider {
    readonly name = "none";
    isEnabled(): boolean;
    createSession(_request: CreateSessionRequest): Promise<ClassroomSession>;
    endSession(_bookingId: string): Promise<void>;
    getRecordingUrl(_bookingId: string): Promise<string | null>;
}
