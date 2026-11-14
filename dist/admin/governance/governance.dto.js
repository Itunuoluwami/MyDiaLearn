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
exports.AuditLogQueryDto = exports.ReviewActionRequestDto = exports.CreateActionRequestDto = exports.ActionRequestsQueryDto = exports.ElevatedRoleRequestDto = exports.SetUserPermissionDto = exports.RedeemInvitationDto = exports.CreateInvitationDto = exports.REQUEST_STATUSES = exports.REQUEST_ACTIONS = void 0;
const class_validator_1 = require("class-validator");
exports.REQUEST_ACTIONS = [
    'payment.refund',
    'booking.cancel_with_refund',
    'payout.settle',
    'user_roles.grant_elevated',
    'profile.suspend',
];
exports.REQUEST_STATUSES = [
    'pending',
    'approved',
    'rejected',
    'executed',
    'failed',
];
class CreateInvitationDto {
    email;
    role;
    permissionKeys;
}
exports.CreateInvitationDto = CreateInvitationDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['admin', 'super_admin']),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(64),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateInvitationDto.prototype, "permissionKeys", void 0);
class RedeemInvitationDto {
    email;
    otp;
}
exports.RedeemInvitationDto = RedeemInvitationDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], RedeemInvitationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], RedeemInvitationDto.prototype, "otp", void 0);
class SetUserPermissionDto {
    granted;
}
exports.SetUserPermissionDto = SetUserPermissionDto;
__decorate([
    (0, class_validator_1.ValidateIf)((_, value) => value !== null),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], SetUserPermissionDto.prototype, "granted", void 0);
class ElevatedRoleRequestDto {
    role;
    revoke;
}
exports.ElevatedRoleRequestDto = ElevatedRoleRequestDto;
__decorate([
    (0, class_validator_1.IsIn)(['admin', 'super_admin']),
    __metadata("design:type", String)
], ElevatedRoleRequestDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ElevatedRoleRequestDto.prototype, "revoke", void 0);
class ActionRequestsQueryDto {
    status;
}
exports.ActionRequestsQueryDto = ActionRequestsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.REQUEST_STATUSES, 'all']),
    __metadata("design:type", String)
], ActionRequestsQueryDto.prototype, "status", void 0);
class CreateActionRequestDto {
    action;
    payload;
}
exports.CreateActionRequestDto = CreateActionRequestDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.REQUEST_ACTIONS),
    __metadata("design:type", Object)
], CreateActionRequestDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateActionRequestDto.prototype, "payload", void 0);
class ReviewActionRequestDto {
    approve;
    notes;
}
exports.ReviewActionRequestDto = ReviewActionRequestDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReviewActionRequestDto.prototype, "approve", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ReviewActionRequestDto.prototype, "notes", void 0);
class AuditLogQueryDto {
    action;
    entityType;
    actorEmail;
    from;
    to;
}
exports.AuditLogQueryDto = AuditLogQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "entityType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "actorEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "to", void 0);
//# sourceMappingURL=governance.dto.js.map