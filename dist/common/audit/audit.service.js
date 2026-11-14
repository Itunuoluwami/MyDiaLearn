"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
exports.redactObject = redactObject;
exports.redact = redact;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const prisma_service_1 = require("../../database/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger;
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
        this.logger.setContext(AuditService_1.name);
    }
    async record(action, options = {}) {
        const metadata = {
            ...redactObject(options.metadata ?? {}),
            ...(options.context?.requestId ? { requestId: options.context.requestId } : {}),
            ...(options.context?.userAgent ? { userAgent: options.context.userAgent } : {}),
        };
        try {
            await this.prisma.$executeRaw `
        insert into public.audit_logs
          (actor_id, actor_email, action, entity_type, entity_id, before, after, metadata, ip)
        values (
          ${options.actorId ?? null}::uuid,
          ${options.actorEmail ?? null},
          ${action},
          ${options.entityType ?? action.split('.')[0]},
          ${options.entityId ?? null}::uuid,
          ${options.before === undefined ? null : JSON.stringify(redact(options.before))}::jsonb,
          ${options.after === undefined ? null : JSON.stringify(redact(options.after))}::jsonb,
          ${JSON.stringify(metadata)}::jsonb,
          ${options.context?.ip ?? null}
        )
      `;
        }
        catch (error) {
            this.logger.error({ err: error, action }, 'Failed to write audit row');
        }
        this.logger.info({
            action,
            actorId: options.actorId,
            entityId: options.entityId,
            ip: options.context?.ip,
        }, action);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_pino_1.PinoLogger])
], AuditService);
const FORBIDDEN = [
    'password',
    'newpassword',
    'currentpassword',
    'confirmpassword',
    'token',
    'accesstoken',
    'refreshtoken',
    'otp',
    'secret',
    'apikey',
    'authorization',
    'cookie',
    'encrypted_password',
    'token_hash',
    'card',
    'cardnumber',
    'cvv',
    'pan',
    'iban',
    'account_number',
];
function redactObject(value) {
    return redact(value);
}
function redact(value, depth = 0) {
    if (depth > 6 || value === null || typeof value !== 'object')
        return value;
    if (Array.isArray(value))
        return value.map((item) => redact(item, depth + 1));
    const out = {};
    for (const [key, val] of Object.entries(value)) {
        out[key] = FORBIDDEN.includes(key.toLowerCase().replace(/[_-]/g, ''))
            ? '[redacted]'
            : redact(val, depth + 1);
    }
    return out;
}
//# sourceMappingURL=audit.service.js.map