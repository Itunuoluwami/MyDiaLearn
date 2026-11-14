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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../common/audit/request-context");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const admin_service_1 = require("./admin.service");
const admin_dto_1 = require("./dto/admin.dto");
const UUID = new common_1.ParseUUIDPipe({ version: '4' });
let AdminController = class AdminController {
    admin;
    constructor(admin) {
        this.admin = admin;
    }
    dashboard(user) {
        return this.admin.dashboard(user.id);
    }
    users(user, query) {
        return this.admin.users(user.id, query);
    }
    suspend(user, id, dto) {
        return this.admin.requestSuspension(user.id, id, dto.isActive);
    }
    verificationQueue(user, query) {
        return this.admin.verificationQueue(user.id, query.status ?? 'pending');
    }
    verificationDetail(user, tutorId) {
        return this.admin.verificationDetail(user.id, tutorId);
    }
    async reviewStep(user, tutorId, stepId, dto) {
        await this.admin.reviewStep(user.id, { tutorId, stepId, ...dto });
    }
    async reviewDocument(user, documentId, dto) {
        await this.admin.reviewDocument(user.id, { documentId, ...dto });
    }
    async approve(user, tutorId, request) {
        await this.admin.approveTutor(user.id, tutorId, (0, request_context_1.auditContextOf)(request));
    }
    async reject(user, tutorId, dto, request) {
        await this.admin.rejectTutor(user.id, tutorId, dto.reason, (0, request_context_1.auditContextOf)(request));
    }
    async setHourlyRate(user, tutorId, dto, request) {
        await this.admin.setHourlyRate(user.id, tutorId, dto.hourlyRate, (0, request_context_1.auditContextOf)(request));
    }
    bookings(user, query) {
        return this.admin.bookings(user.id, query);
    }
    async overrideBookingStatus(user, id, dto) {
        await this.admin.overrideBookingStatus(user.id, id, dto.status);
    }
    requestCancellation(user, id, dto) {
        return this.admin.requestCancellation(user.id, id, dto);
    }
    payments(user, query) {
        return this.admin.payments(user.id, query);
    }
    requestRefund(user, id, dto) {
        return this.admin.requestRefund(user.id, id, dto);
    }
    payouts(user, query) {
        return this.admin.payouts(user.id, query.status ?? 'all');
    }
    requestSettlement(user, id) {
        return this.admin.requestPayoutSettlement(user.id, id);
    }
    async rejectPayout(user, id, dto) {
        await this.admin.rejectPayout(user.id, id, dto.notes);
    }
    disputes(user, query) {
        return this.admin.disputes(user.id, query.status ?? 'open');
    }
    async resolveDispute(user, id, dto, request) {
        await this.admin.resolveDispute(user.id, id, dto, (0, request_context_1.auditContextOf)(request));
    }
    reviews(user, query) {
        const published = query.published === undefined ? null : query.published === 'true';
        return this.admin.reviews(user.id, published);
    }
    async setReviewPublished(user, id, dto) {
        await this.admin.setReviewPublished(user.id, id, dto.isPublished);
    }
    messages(user, query) {
        return this.admin.messages(user.id, query.search);
    }
    async setMessageHidden(user, id, dto) {
        await this.admin.setMessageHidden(user.id, id, dto);
    }
    report(user, query) {
        return this.admin.report(user.id, query.from, query.to);
    }
    agencies(user, query) {
        return this.admin.agencies(user.id, query.status ?? 'pending');
    }
    agency(user, id) {
        return this.admin.agency(user.id, id);
    }
    async reviewAgencyStep(user, agencyId, stepId, dto) {
        await this.admin.reviewAgencyStep(user.id, { agencyId, stepId, ...dto });
    }
    async decideAgency(user, id, dto, request) {
        await this.admin.decideAgency(user.id, id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async setAgencyShare(user, id, dto, request) {
        await this.admin.setAgencyShare(user.id, id, dto.revenueSharePercentage, (0, request_context_1.auditContextOf)(request));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.RequirePermission)('admin.users'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminUsersQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "users", null);
__decorate([
    (0, common_1.Post)('users/:id/suspend'),
    (0, roles_decorator_1.RequirePermission)('admin.users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.SuspendUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspend", null);
__decorate([
    (0, common_1.Get)('verification'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.VerificationQueueQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verificationQueue", null);
__decorate([
    (0, common_1.Get)('verification/:tutorId'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verificationDetail", null);
__decorate([
    (0, common_1.Put)('verification/:tutorId/steps/:stepId'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Param)('stepId', UUID)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, admin_dto_1.ReviewVerificationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewStep", null);
__decorate([
    (0, common_1.Patch)('verification/documents/:documentId'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('documentId', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.ReviewVerificationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewDocument", null);
__decorate([
    (0, common_1.Post)('verification/:tutorId/approve'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('verification/:tutorId/reject'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.RejectTutorDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)('tutors/:tutorId/hourly-rate'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tutorId', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.SetHourlyRateDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setHourlyRate", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, roles_decorator_1.RequirePermission)('admin.bookings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminBookingsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    (0, roles_decorator_1.RequirePermission)('admin.bookings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.OverrideBookingStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "overrideBookingStatus", null);
__decorate([
    (0, common_1.Post)('bookings/:id/cancel'),
    (0, roles_decorator_1.RequirePermission)('admin.bookings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.CancelBookingRequestDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "requestCancellation", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, roles_decorator_1.RequirePermission)('admin.payments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminPaymentsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "payments", null);
__decorate([
    (0, common_1.Post)('payments/:id/refund'),
    (0, roles_decorator_1.RequirePermission)('admin.payments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.RefundRequestDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "requestRefund", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, roles_decorator_1.RequirePermission)('admin.payouts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminPayoutsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "payouts", null);
__decorate([
    (0, common_1.Post)('payouts/:id/settle'),
    (0, roles_decorator_1.RequirePermission)('admin.payouts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "requestSettlement", null);
__decorate([
    (0, common_1.Post)('payouts/:id/reject'),
    (0, roles_decorator_1.RequirePermission)('admin.payouts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.RejectPayoutDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectPayout", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, roles_decorator_1.RequirePermission)('admin.disputes'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AdminDisputesQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "disputes", null);
__decorate([
    (0, common_1.Post)('disputes/:id/resolve'),
    (0, roles_decorator_1.RequirePermission)('admin.disputes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.ResolveDisputeDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resolveDispute", null);
__decorate([
    (0, common_1.Get)('moderation/reviews'),
    (0, roles_decorator_1.RequirePermission)('admin.moderation'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.ModerationReviewsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviews", null);
__decorate([
    (0, common_1.Patch)('moderation/reviews/:id'),
    (0, roles_decorator_1.RequirePermission)('admin.moderation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.SetReviewPublishedDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setReviewPublished", null);
__decorate([
    (0, common_1.Get)('moderation/messages'),
    (0, roles_decorator_1.RequirePermission)('admin.moderation'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.ModerationMessagesQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "messages", null);
__decorate([
    (0, common_1.Patch)('moderation/messages/:id'),
    (0, roles_decorator_1.RequirePermission)('admin.moderation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.SetMessageHiddenDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setMessageHidden", null);
__decorate([
    (0, common_1.Get)('reports/summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.ReportQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('agencies'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.AgencyQueueQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "agencies", null);
__decorate([
    (0, common_1.Get)('agencies/:id'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "agency", null);
__decorate([
    (0, common_1.Put)('agencies/:id/steps/:stepId'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Param)('stepId', UUID)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, admin_dto_1.ReviewVerificationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewAgencyStep", null);
__decorate([
    (0, common_1.Post)('agencies/:id/decision'),
    (0, roles_decorator_1.RequirePermission)('admin.verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.AgencyDecisionDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "decideAgency", null);
__decorate([
    (0, common_1.Patch)('agencies/:id/revenue-share'),
    (0, roles_decorator_1.RequirePermission)('admin.settings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.AgencyShareDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setAgencyShare", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map