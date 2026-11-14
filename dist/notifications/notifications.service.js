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
exports.NotificationsService = void 0;
exports.toResponse = toResponse;
const common_1 = require("@nestjs/common");
const query_dto_1 = require("../shared/query.dto");
const notifications_repository_1 = require("./notifications.repository");
let NotificationsService = class NotificationsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list(userId, query) {
        const { rows, total } = await this.repository.listForUser(userId, query);
        return (0, query_dto_1.paginate)(rows.map(toResponse), total, query);
    }
    async unreadCount(userId) {
        return this.repository.countUnread(userId);
    }
    async markRead(userId, ids) {
        if (!ids.length)
            return { updated: 0 };
        return { updated: await this.repository.markRead(userId, ids) };
    }
    async markAllRead(userId) {
        return { updated: await this.repository.markAllRead(userId) };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository])
], NotificationsService);
function toResponse(row) {
    return {
        id: row.id,
        triggerKey: row.trigger_key,
        channel: row.channel,
        subject: row.title,
        body: row.body,
        link: row.link,
        read: row.read_at !== null,
        readAt: row.read_at ? row.read_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
    };
}
//# sourceMappingURL=notifications.service.js.map