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
exports.MessagingService = void 0;
exports.toResponse = toResponse;
const common_1 = require("@nestjs/common");
const notification_dispatch_service_1 = require("../notifications/services/notification-dispatch.service");
const app_exception_1 = require("../common/exceptions/app.exception");
const query_dto_1 = require("../shared/query.dto");
const messaging_repository_1 = require("./messaging.repository");
let MessagingService = class MessagingService {
    repository;
    notifications;
    constructor(repository, notifications) {
        this.repository = repository;
        this.notifications = notifications;
    }
    async emailParticipants(senderId, conversationId, body) {
        try {
            const recipients = await this.repository.messageRecipients(conversationId, senderId);
            const preview = body.length > 140 ? `${body.slice(0, 137)}...` : body;
            for (const recipient of recipients) {
                await this.notifications.dispatchEmail({
                    to: recipient.email,
                    triggerKey: 'message.received',
                    vars: { sender_name: recipient.sender_name ?? 'Someone', preview },
                });
            }
        }
        catch {
        }
    }
    listConversations(userId) {
        return this.repository.listConversations(userId);
    }
    async messages(userId, conversationId, query) {
        const conversation = await this.repository.findConversation(userId, conversationId);
        if (!conversation)
            throw new app_exception_1.NotFoundError('Conversation');
        const { rows, total } = await this.repository.listMessages(userId, conversationId, query);
        return (0, query_dto_1.paginate)(rows.map(toResponse), total, query);
    }
    async send(userId, conversationId, input) {
        const message = await this.repository.sendMessage(userId, {
            conversationId,
            body: input.body,
            attachmentPath: input.attachmentPath,
            attachmentName: input.attachmentName,
        });
        await this.emailParticipants(userId, conversationId, input.body);
        return toResponse(message);
    }
    async markRead(userId, conversationId) {
        await this.repository.markRead(userId, conversationId);
    }
    async startConversation(tutorUserId, input) {
        return { id: await this.repository.startConversation(tutorUserId, input) };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [messaging_repository_1.MessagingRepository,
        notification_dispatch_service_1.NotificationDispatchService])
], MessagingService);
function toResponse(row) {
    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        body: row.is_hidden ? '[This message was removed by a moderator.]' : row.body,
        attachmentName: row.is_hidden ? null : row.attachment_name,
        isHidden: row.is_hidden,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=messaging.service.js.map