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
exports.AgencyShareDto = exports.AgencyDecisionDto = exports.AgencyQueueQueryDto = exports.ReportQueryDto = exports.SetMessageHiddenDto = exports.ModerationMessagesQueryDto = exports.SetReviewPublishedDto = exports.ModerationReviewsQueryDto = exports.ResolveDisputeDto = exports.AdminDisputesQueryDto = exports.RejectPayoutDto = exports.AdminPayoutsQueryDto = exports.RefundRequestDto = exports.AdminPaymentsQueryDto = exports.CancelBookingRequestDto = exports.OverrideBookingStatusDto = exports.AdminBookingsQueryDto = exports.DISPUTE_STATUSES = exports.PAYOUT_STATUSES = exports.PAYMENT_STATUSES = exports.BOOKING_STATUSES = exports.BOOKING_OVERRIDE_STATUSES = exports.SetHourlyRateDto = exports.RejectTutorDto = exports.ReviewVerificationDto = exports.VerificationQueueQueryDto = exports.SuspendUserDto = exports.AdminUsersQueryDto = exports.VERIFICATION_STATUSES = exports.APP_ROLES = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.APP_ROLES = [
    'student',
    'parent',
    'tutor',
    'agency',
    'admin',
    'super_admin',
];
exports.VERIFICATION_STATUSES = [
    'unverified',
    'pending',
    'in_review',
    'verified',
    'rejected',
    'suspended',
];
class AdminUsersQueryDto {
    search;
    role;
    from;
    to;
}
exports.AdminUsersQueryDto = AdminUsersQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.APP_ROLES),
    __metadata("design:type", Object)
], AdminUsersQueryDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminUsersQueryDto.prototype, "to", void 0);
class SuspendUserDto {
    isActive;
}
exports.SuspendUserDto = SuspendUserDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SuspendUserDto.prototype, "isActive", void 0);
class VerificationQueueQueryDto {
    status;
}
exports.VerificationQueueQueryDto = VerificationQueueQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.VERIFICATION_STATUSES, 'all']),
    __metadata("design:type", Object)
], VerificationQueueQueryDto.prototype, "status", void 0);
class ReviewVerificationDto {
    status;
    reviewerNotes;
}
exports.ReviewVerificationDto = ReviewVerificationDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.VERIFICATION_STATUSES),
    __metadata("design:type", Object)
], ReviewVerificationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ReviewVerificationDto.prototype, "reviewerNotes", void 0);
class RejectTutorDto {
    reason;
}
exports.RejectTutorDto = RejectTutorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], RejectTutorDto.prototype, "reason", void 0);
class SetHourlyRateDto {
    hourlyRate;
}
exports.SetHourlyRateDto = SetHourlyRateDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], SetHourlyRateDto.prototype, "hourlyRate", void 0);
exports.BOOKING_OVERRIDE_STATUSES = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'no_show',
    'rejected',
];
exports.BOOKING_STATUSES = [...exports.BOOKING_OVERRIDE_STATUSES, 'cancelled'];
exports.PAYMENT_STATUSES = [
    'pending',
    'processing',
    'paid',
    'failed',
    'refunded',
    'partially_refunded',
];
exports.PAYOUT_STATUSES = [
    'requested',
    'processing',
    'paid',
    'rejected',
    'cancelled',
];
exports.DISPUTE_STATUSES = ['open', 'investigating', 'resolved', 'dismissed'];
class AdminBookingsQueryDto {
    search;
    status;
    from;
    to;
}
exports.AdminBookingsQueryDto = AdminBookingsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], AdminBookingsQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.BOOKING_STATUSES, 'all']),
    __metadata("design:type", Object)
], AdminBookingsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminBookingsQueryDto.prototype, "to", void 0);
class OverrideBookingStatusDto {
    status;
}
exports.OverrideBookingStatusDto = OverrideBookingStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.BOOKING_OVERRIDE_STATUSES),
    __metadata("design:type", Object)
], OverrideBookingStatusDto.prototype, "status", void 0);
class CancelBookingRequestDto {
    reason;
    refundPercentage;
}
exports.CancelBookingRequestDto = CancelBookingRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CancelBookingRequestDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CancelBookingRequestDto.prototype, "refundPercentage", void 0);
class AdminPaymentsQueryDto {
    status;
    from;
    to;
}
exports.AdminPaymentsQueryDto = AdminPaymentsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.PAYMENT_STATUSES, 'all', 'flagged', 'refunded']),
    __metadata("design:type", String)
], AdminPaymentsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminPaymentsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminPaymentsQueryDto.prototype, "to", void 0);
class RefundRequestDto {
    amount;
    reason;
}
exports.RefundRequestDto = RefundRequestDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RefundRequestDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RefundRequestDto.prototype, "reason", void 0);
class AdminPayoutsQueryDto {
    status;
}
exports.AdminPayoutsQueryDto = AdminPayoutsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.PAYOUT_STATUSES, 'all']),
    __metadata("design:type", String)
], AdminPayoutsQueryDto.prototype, "status", void 0);
class RejectPayoutDto {
    notes;
}
exports.RejectPayoutDto = RejectPayoutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RejectPayoutDto.prototype, "notes", void 0);
class AdminDisputesQueryDto {
    status;
}
exports.AdminDisputesQueryDto = AdminDisputesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.DISPUTE_STATUSES, 'all']),
    __metadata("design:type", String)
], AdminDisputesQueryDto.prototype, "status", void 0);
class ResolveDisputeDto {
    status;
    notes;
}
exports.ResolveDisputeDto = ResolveDisputeDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.DISPUTE_STATUSES),
    __metadata("design:type", Object)
], ResolveDisputeDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ResolveDisputeDto.prototype, "notes", void 0);
class ModerationReviewsQueryDto {
    published;
}
exports.ModerationReviewsQueryDto = ModerationReviewsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['true', 'false']),
    __metadata("design:type", String)
], ModerationReviewsQueryDto.prototype, "published", void 0);
class SetReviewPublishedDto {
    isPublished;
}
exports.SetReviewPublishedDto = SetReviewPublishedDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetReviewPublishedDto.prototype, "isPublished", void 0);
class ModerationMessagesQueryDto {
    search;
}
exports.ModerationMessagesQueryDto = ModerationMessagesQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ModerationMessagesQueryDto.prototype, "search", void 0);
class SetMessageHiddenDto {
    isHidden;
    reason;
}
exports.SetMessageHiddenDto = SetMessageHiddenDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetMessageHiddenDto.prototype, "isHidden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SetMessageHiddenDto.prototype, "reason", void 0);
class ReportQueryDto {
    from;
    to;
}
exports.ReportQueryDto = ReportQueryDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportQueryDto.prototype, "to", void 0);
class AgencyQueueQueryDto {
    status;
}
exports.AgencyQueueQueryDto = AgencyQueueQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([...exports.VERIFICATION_STATUSES, 'all']),
    __metadata("design:type", String)
], AgencyQueueQueryDto.prototype, "status", void 0);
class AgencyDecisionDto {
    status;
    reason;
}
exports.AgencyDecisionDto = AgencyDecisionDto;
__decorate([
    (0, class_validator_1.IsIn)(['verified', 'rejected', 'suspended']),
    __metadata("design:type", String)
], AgencyDecisionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], AgencyDecisionDto.prototype, "reason", void 0);
class AgencyShareDto {
    revenueSharePercentage;
}
exports.AgencyShareDto = AgencyShareDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AgencyShareDto.prototype, "revenueSharePercentage", void 0);
//# sourceMappingURL=admin.dto.js.map