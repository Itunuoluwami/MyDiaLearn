import { Module } from '@nestjs/common';

import { TutorAvailabilityRepository } from './tutor-availability.repository';
import { TutorVerificationRepository } from './tutor-verification.repository';
import { TutorAvailabilityService } from './services/tutor-availability.service';
import { TutorVerificationService } from './services/tutor-verification.service';
import { TutorsController } from './tutors.controller';
import { TutorsRepository } from './tutors.repository';
import { TutorsService } from './tutors.service';

/**
 * The tutor workspace: profile, subjects taught, availability and verification.
 *
 * Four of the brief's modules live here — Tutors, Qualifications, Verification
 * and Availability — because they share one aggregate root and one ownership
 * check. They are separated by service and repository rather than by module, so
 * the boundaries are real without fragmenting a tutor across four packages.
 *
 * Replaces tutor_dashboard_summary(), tutor_students(), tutor_reviews(),
 * tutor_rating_summary(), tutor_rating_categories(), ensure_tutor_record() and
 * tutor_submit_verification(), plus the tutors, tutor_subjects,
 * availability_windows, tutor_documents and tutor_verification_progress tables.
 */
@Module({
  controllers: [TutorsController],
  providers: [
    TutorsRepository,
    TutorAvailabilityRepository,
    TutorVerificationRepository,
    TutorsService,
    TutorAvailabilityService,
    TutorVerificationService,
  ],
  exports: [TutorsService, TutorAvailabilityService, TutorVerificationService],
})
export class TutorsModule {}
