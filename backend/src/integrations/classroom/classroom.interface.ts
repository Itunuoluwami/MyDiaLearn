/**
 * Live classroom port.
 *
 * class_sessions already carries meeting_url, meeting_provider and
 * recording_url, and nothing has ever populated them. The classroom route
 * renders its own mic/camera/screen-share controls over a chat backed by the
 * messages table, so the columns describe an integration that was designed for
 * and never built.
 *
 * The port is named after those columns so that wiring a real provider later
 * is a write to existing fields rather than a schema change.
 */
export interface ClassroomSession {
  /** Stored in class_sessions.meeting_url. */
  joinUrl: string;
  /** Stored in class_sessions.meeting_provider. */
  provider: string;
  /** Host-privileged URL, where the provider distinguishes the two. */
  hostUrl?: string;
  expiresAt?: Date;
}

export interface CreateSessionRequest {
  bookingId: string;
  /** Scheduled start; providers commonly refuse rooms opened too early. */
  startsAt: Date;
  durationMinutes: number;
  hostName: string;
  subject?: string;
}

export interface ClassroomProvider {
  readonly name: string;
  /** Whether a real provider is configured. False for the null adapter. */
  isEnabled(): boolean;
  createSession(request: CreateSessionRequest): Promise<ClassroomSession>;
  endSession(bookingId: string): Promise<void>;
  /** Recording URL once processed, where the provider supports it. */
  getRecordingUrl(bookingId: string): Promise<string | null>;
}

export const CLASSROOM_PROVIDER = Symbol('ClassroomProvider');
