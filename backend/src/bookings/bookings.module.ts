import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

/**
 * Booking lifecycle, classroom sessions and cancellation.
 *
 * Deliberately thin: the invariants that matter — no overlapping bookings,
 * availability, the two-sided confirmation rule — live in PostgreSQL, where
 * they cannot be raced or forgotten. See bookings.service.ts.
 */
@Module({
  imports: [NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
