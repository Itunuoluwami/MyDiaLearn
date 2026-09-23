import { Injectable } from '@nestjs/common';

import { NotImplementedError } from '../../common/exceptions/app.exception';
import type {
  ClassroomProvider,
  ClassroomSession,
  CreateSessionRequest,
} from './classroom.interface';

/**
 * No video provider — today's actual behaviour.
 *
 * `isEnabled()` returns false so callers can degrade gracefully rather than
 * catching an exception on a normal path: the classroom UI works without a
 * meeting URL, exactly as it does now. Actually asking for a session still
 * throws, because silently returning a fake URL would put a dead link in front
 * of a tutor and a student at lesson time.
 */
@Injectable()
export class NoneClassroomProvider implements ClassroomProvider {
  readonly name = 'none';

  isEnabled(): boolean {
    return false;
  }

  async createSession(_request: CreateSessionRequest): Promise<ClassroomSession> {
    throw new NotImplementedError('Live classroom provider');
  }

  async endSession(_bookingId: string): Promise<void> {
    // No-op: with no provider there is no remote room to tear down, and the
    // lesson still ends correctly through tutor_end_class().
  }

  async getRecordingUrl(_bookingId: string): Promise<string | null> {
    return null;
  }
}
