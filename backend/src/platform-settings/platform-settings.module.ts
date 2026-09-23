import { Global, Module } from '@nestjs/common';

import { PlatformSettingsRepository } from './platform-settings.repository';
import { PlatformSettingsService } from './platform-settings.service';

/**
 * Global because operating rules are cross-cutting: bookings need durations
 * and notice periods, payouts need thresholds, auth needs country lists.
 */
@Global()
@Module({
  providers: [PlatformSettingsRepository, PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
