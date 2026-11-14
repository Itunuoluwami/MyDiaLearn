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
exports.NotificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let NotificationsRepository = class NotificationsRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async listForUser(userId, query) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, user_id, trigger_key, channel::text, title, body, link, read_at, created_at
        from public.notifications
        where user_id = ${userId}::uuid
        order by created_at desc
        limit ${query.limit} offset ${query.skip}
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.notifications where user_id = ${userId}::uuid
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async countUnread(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select count(*)::bigint n
        from public.notifications
        where user_id = ${userId}::uuid and read_at is null
      `;
            return Number(rows[0]?.n ?? 0);
        });
    }
    async markRead(userId, ids) {
        return this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        update public.notifications
        set read_at = coalesce(read_at, now())
        where user_id = ${userId}::uuid
          and id = any(${ids}::uuid[])
          and read_at is null
      `);
    }
    async markAllRead(userId) {
        return this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        update public.notifications
        set read_at = now()
        where user_id = ${userId}::uuid and read_at is null
      `);
    }
    async notify(actorId, input) {
        await this.prisma.withUser(actorId, async (tx) => {
            await tx.$executeRaw `
        select public.notify_user(
          ${input.userId}::uuid,
          ${input.triggerKey},
          ${JSON.stringify(input.vars)}::jsonb,
          ${input.link ?? null}
        )
      `;
        });
    }
    async findTemplates() {
        return this.prisma.$queryRaw `
      select id, trigger_key, channel::text, subject, body, is_active
      from public.notification_templates
      order by trigger_key, channel
    `;
    }
    async findTemplate(triggerKey, channel) {
        const rows = await this.prisma.$queryRaw `
      select id, trigger_key, channel::text, subject, body, is_active
      from public.notification_templates
      where trigger_key = ${triggerKey} and channel::text = ${channel} and is_active
      limit 1
    `;
        return rows[0] ?? null;
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map