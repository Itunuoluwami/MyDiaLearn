import { Global, Module } from '@nestjs/common';

import { AuditService } from './audit.service';

/** Global: every domain records sensitive operations. */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
