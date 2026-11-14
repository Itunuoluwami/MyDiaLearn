import type { Request } from 'express';
import type { AuditContext } from './audit.service';
export declare function auditContextOf(request: Request): AuditContext;
