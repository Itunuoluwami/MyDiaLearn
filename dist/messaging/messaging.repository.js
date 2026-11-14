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
exports.MessagingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
const app_exception_1 = require("../common/exceptions/app.exception");
let MessagingRepository = class MessagingRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async listConversations(userId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `select * from public.my_conversations()`);
    }
    async findConversation(userId, id) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select id, subject, booking_id, student_id, created_by, last_message_at, created_at
        from public.conversations where id = ${id}::uuid
      `;
            return rows[0] ?? null;
        });
    }
    async listMessages(userId, conversationId, query) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select * from (
          select id, conversation_id, sender_id, body, attachment_path, attachment_name,
                 is_hidden, hidden_reason, created_at
          from public.messages
          where conversation_id = ${conversationId}::uuid
          order by created_at desc
          limit ${query.limit} offset ${query.skip}
        ) recent
        order by created_at asc
      `;
            const counted = await tx.$queryRaw `
        select count(*)::bigint n from public.messages
        where conversation_id = ${conversationId}::uuid
      `;
            return { rows, total: Number(counted[0]?.n ?? 0) };
        });
    }
    async messageRecipients(conversationId, senderId) {
        return this.prisma.$queryRaw `
      select p.email,
             (select full_name from public.profiles where id = ${senderId}::uuid) as sender_name
      from public.conversation_participants cp
      join public.profiles p on p.id = cp.user_id
      where cp.conversation_id = ${conversationId}::uuid
        and cp.user_id <> ${senderId}::uuid
        and p.email is not null
    `;
    }
    async sendMessage(userId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const member = await tx.$queryRaw `
        select public.in_conversation(${input.conversationId}::uuid) as ok
      `;
            if (!member[0]?.ok)
                throw new app_exception_1.NotAuthorizedError('You are not part of this conversation.');
            const rows = await tx.$queryRaw `
        insert into public.messages
          (conversation_id, sender_id, body, attachment_path, attachment_name)
        values (
          ${input.conversationId}::uuid, ${userId}::uuid, ${input.body},
          ${input.attachmentPath ?? null}, ${input.attachmentName ?? null}
        )
        returning id, conversation_id, sender_id, body, attachment_path, attachment_name,
                  is_hidden, hidden_reason, created_at
      `;
            await tx.$executeRaw `
        update public.conversations set last_message_at = now(), updated_at = now()
        where id = ${input.conversationId}::uuid
      `;
            return rows[0];
        });
    }
    async markRead(userId, conversationId) {
        await this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `
        update public.conversation_participants set last_read_at = now()
        where conversation_id = ${conversationId}::uuid and user_id = ${userId}::uuid
      `;
        });
    }
    async startConversation(tutorUserId, input) {
        return this.prisma.withUser(tutorUserId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.tutor_start_conversation(${input.studentId}::uuid, ${input.subject ?? null}::text) as id
      `;
            return rows[0].id;
        });
    }
};
exports.MessagingRepository = MessagingRepository;
exports.MessagingRepository = MessagingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagingRepository);
//# sourceMappingURL=messaging.repository.js.map