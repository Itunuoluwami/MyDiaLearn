import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { ProfileRepository } from './repositories/profile.repository';

/**
 * Global so feature modules inject repositories without re-importing this.
 *
 * Only repositories are exported — PrismaService is exported too, but that is
 * for the health check and for repositories themselves. Application services
 * are expected to depend on a repository, never on PrismaService directly;
 * see docs/backend-architecture.md.
 */
@Global()
@Module({
  providers: [PrismaService, ProfileRepository],
  exports: [PrismaService, ProfileRepository],
})
export class DatabaseModule {}
