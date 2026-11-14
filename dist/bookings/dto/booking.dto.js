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
exports.TutorScheduleQueryDto = exports.ListBookingsQueryDto = exports.AvailableSlotsQueryDto = exports.EndClassDto = exports.FamilyCancelDto = exports.RaiseDisputeDto = exports.DISPUTE_CATEGORIES = exports.RateBookingDto = exports.RespondBookingDto = exports.CreateBookingDto = exports.BOOKING_STATUSES = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const query_dto_1 = require("../../shared/query.dto");
exports.BOOKING_STATUSES = [
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
];
class CreateBookingDto {
    studentId;
    tutorId;
    subjectId;
    educationLevelId;
    startsAt;
    durationMinutes;
    timezone;
    studentNotes;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "tutorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "educationLevelId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "studentNotes", void 0);
class RespondBookingDto {
    accept;
}
exports.RespondBookingDto = RespondBookingDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RespondBookingDto.prototype, "accept", void 0);
class RateBookingDto {
    score;
    comment;
}
exports.RateBookingDto = RateBookingDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], RateBookingDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], RateBookingDto.prototype, "comment", void 0);
exports.DISPUTE_CATEGORIES = [
    'payment',
    'conduct',
    'quality',
    'scheduling',
    'other',
];
class RaiseDisputeDto {
    category;
    description;
}
exports.RaiseDisputeDto = RaiseDisputeDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.DISPUTE_CATEGORIES),
    __metadata("design:type", Object)
], RaiseDisputeDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Please describe what went wrong.' }),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], RaiseDisputeDto.prototype, "description", void 0);
class FamilyCancelDto {
    reason;
}
exports.FamilyCancelDto = FamilyCancelDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], FamilyCancelDto.prototype, "reason", void 0);
class EndClassDto {
    studentAttended;
}
exports.EndClassDto = EndClassDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EndClassDto.prototype, "studentAttended", void 0);
class AvailableSlotsQueryDto {
    tutorId;
    from;
    days = 14;
    durationMinutes;
}
exports.AvailableSlotsQueryDto = AvailableSlotsQueryDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], AvailableSlotsQueryDto.prototype, "tutorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AvailableSlotsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Object)
], AvailableSlotsQueryDto.prototype, "days", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], AvailableSlotsQueryDto.prototype, "durationMinutes", void 0);
class ListBookingsQueryDto extends query_dto_1.PaginationQueryDto {
    status;
    from;
    to;
}
exports.ListBookingsQueryDto = ListBookingsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.BOOKING_STATUSES),
    __metadata("design:type", Object)
], ListBookingsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListBookingsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListBookingsQueryDto.prototype, "to", void 0);
class TutorScheduleQueryDto {
    statuses;
    from;
    to;
}
exports.TutorScheduleQueryDto = TutorScheduleQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.split(',').filter(Boolean) : value),
    (0, class_validator_1.IsIn)(exports.BOOKING_STATUSES, { each: true }),
    __metadata("design:type", Array)
], TutorScheduleQueryDto.prototype, "statuses", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TutorScheduleQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TutorScheduleQueryDto.prototype, "to", void 0);
//# sourceMappingURL=booking.dto.js.map