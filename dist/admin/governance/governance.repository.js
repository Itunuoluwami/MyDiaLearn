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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const base_repository_1 = require("../../database/repositories/base.repository");
let GovernanceRepository = class GovernanceRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async adminAccounts(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select p.id, p.full_name, p.email, p.is_active, p.must_change_password, p.created_at,
               array_agg(ur.role::text order by ur.role::text) as roles
        from public.profiles p
        join public.user_roles ur on ur.user_id = p.id and ur.role in ('admin', 'super_admin')
        group by p.id
        order by p.created_at desc
      `);
    }
    async invitations(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, email, invited_by, role::text, permission_keys, otp_expires_at, status::text,
               accepted_at, created_at, updated_at
        from public.admin_invitations
        order by created_at desc
        limit 100
      `);
    }
    async createInvitation(adminId, input) {
        return this.prisma.withUser(adminId, async (tx) => {
            const rows = await tx.$queryRaw `
        select * from public.admin_invite_create(
          ${input.email}, ${input.role}::public.app_role, ${input.permissionKeys}::text[]
        )
      `;
            return rows[0];
        });
    }
    async revokeInvitation(adminId, invitationId) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `select public.admin_invite_revoke(${invitationId}::uuid)`;
        });
    }
    async redeemInvitation(userId, email, otp) {
        await this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `select public.admin_invite_redeem(${email}, ${otp})`;
        });
    }
    async permissionCatalog(adminId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select key, label, description, category from public.permissions order by category, key
      `);
    }
    async userPermissions(adminId, userId) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, user_id, permission_key, granted, granted_by, created_at
        from public.user_permissions where user_id = ${userId}::uuid
      `);
    }
    async setUserPermission(adminId, userId, key, granted) {
        await this.prisma.withUser(adminId, async (tx) => {
            await tx.$executeRaw `
        select public.admin_set_user_permission(${userId}::uuid, ${key}, ${granted}::boolean)
      `;
        });
    }
    async requestAction(adminId, action, payload) {
        return this.prisma.withUser(adminId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.admin_request_action(${action}, ${JSON.stringify(payload)}::jsonb) as id
      `;
            return rows[0].id;
        });
    }
    async actionRequests(adminId, status) {
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select r.id, r.action, r.payload, r.requested_by, r.requested_at, r.status::text,
               r.reviewed_by, r.reviewed_at, r.review_notes, r.executed_at, r.execution_error,
               r.created_at, r.updated_at,
               rq.full_name as requester_name, rq.email as requester_email,
               rv.full_name as reviewer_name, rv.email as reviewer_email
        from public.admin_action_requests r
        left join public.profiles rq on rq.id = r.requested_by
        left join public.profiles rv on rv.id = r.reviewed_by
        where ${status} = 'all' or r.status::text = ${status}
        order by r.requested_at desc
        limit 200
      `);
    }
    async reviewAction(adminId, requestId, approve, notes) {
        return this.prisma.withUser(adminId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, action, status::text, reviewed_at, executed_at, execution_error
        from public.admin_review_action(${requestId}::uuid, ${approve}, ${notes}::text)
      `;
            return rows[0];
        });
    }
    async auditLogs(adminId, filters) {
        const action = filters.action ? `%${filters.action}%` : null;
        const actor = filters.actorEmail ? `%${filters.actorEmail}%` : null;
        return this.prisma.withUser(adminId, async (tx) => tx.$queryRaw `
        select id, actor_id, actor_email, action, entity_type, entity_id, before, after,
               metadata, ip, created_at
        from public.audit_logs
        where (${action}::text is null or action ilike ${action})
          and (${filters.entityType}::text is null or entity_type = ${filters.entityType})
          and (${actor}::text is null or actor_email ilike ${actor})
          and (${filters.from}::timestamptz is null or created_at >= ${filters.from})
          and (${filters.to}::timestamptz is null or created_at <= ${filters.to})
        order by created_at desc
        limit 300
      `);
    }
};
exports.GovernanceRepository = GovernanceRepository;
exports.GovernanceRepository = GovernanceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GovernanceRepository);
//# sourceMappingURL=governance.repository.js.map