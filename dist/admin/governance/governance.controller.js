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
exports.InvitationsController = exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../../common/audit/request-context");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const governance_dto_1 = require("./governance.dto");
const governance_service_1 = require("./governance.service");
const UUID = new common_1.ParseUUIDPipe({ version: '4' });
let GovernanceController = class GovernanceController {
    governance;
    constructor(governance) {
        this.governance = governance;
    }
    accounts(user) {
        return this.governance.adminAccounts(user.id);
    }
    invitations(user) {
        return this.governance.invitations(user.id);
    }
    invite(user, dto, request) {
        return this.governance.invite(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async revoke(user, id, request) {
        await this.governance.revokeInvitation(user.id, id, (0, request_context_1.auditContextOf)(request));
    }
    permissionCatalog(user) {
        return this.governance.permissionCatalog(user.id);
    }
    userPermissions(user, id) {
        return this.governance.userPermissions(user.id, id);
    }
    async setUserPermission(user, id, key, dto, request) {
        await this.governance.setUserPermission(user.id, id, key, dto.granted, (0, request_context_1.auditContextOf)(request));
    }
    requestElevatedRole(user, id, dto) {
        return this.governance.requestAction(user.id, 'user_roles.grant_elevated', {
            user_id: id,
            role: dto.role,
            revoke: dto.revoke ?? false,
        });
    }
    requests(user, query) {
        return this.governance.actionRequests(user.id, query.status ?? 'pending');
    }
    createRequest(user, dto) {
        return this.governance.requestAction(user.id, dto.action, dto.payload);
    }
    review(user, id, dto, request) {
        return this.governance.reviewAction(user.id, id, dto, (0, request_context_1.auditContextOf)(request));
    }
    auditLogs(user, query) {
        return this.governance.auditLogs(user.id, query);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Get)('accounts'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "accounts", null);
__decorate([
    (0, common_1.Get)('invitations'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "invitations", null);
__decorate([
    (0, common_1.Post)('invitations'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, governance_dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('invitations/:id/revoke'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "revoke", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "permissionCatalog", null);
__decorate([
    (0, common_1.Get)('users/:id/permissions'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "userPermissions", null);
__decorate([
    (0, common_1.Put)('users/:id/permissions/:key'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Param)('key')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, governance_dto_1.SetUserPermissionDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "setUserPermission", null);
__decorate([
    (0, common_1.Post)('users/:id/elevated-role'),
    (0, roles_decorator_1.RequirePermission)('admin.admins'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, governance_dto_1.ElevatedRoleRequestDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "requestElevatedRole", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, roles_decorator_1.RequirePermission)('admin.approvals'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, governance_dto_1.ActionRequestsQueryDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "requests", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, roles_decorator_1.RequirePermission)('admin.approvals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, governance_dto_1.CreateActionRequestDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Post)('requests/:id/review'),
    (0, roles_decorator_1.RequirePermission)('admin.approvals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', UUID)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, governance_dto_1.ReviewActionRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "review", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.RequirePermission)('admin.audit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, governance_dto_1.AuditLogQueryDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "auditLogs", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, common_1.Controller)('admin/governance'),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
let InvitationsController = class InvitationsController {
    governance;
    constructor(governance) {
        this.governance = governance;
    }
    async redeem(user, dto) {
        await this.governance.redeemInvitation(user.id, dto.email, dto.otp);
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, governance_dto_1.RedeemInvitationDto]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "redeem", null);
exports.InvitationsController = InvitationsController = __decorate([
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], InvitationsController);
//# sourceMappingURL=governance.controller.js.map