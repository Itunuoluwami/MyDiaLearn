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
exports.ListPaymentsQueryDto = exports.RequestPayoutDto = exports.PayForBookingDto = exports.QuoteBookingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const query_dto_1 = require("../../shared/query.dto");
class QuoteBookingDto {
    tutorId;
    durationMinutes;
}
exports.QuoteBookingDto = QuoteBookingDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], QuoteBookingDto.prototype, "tutorId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], QuoteBookingDto.prototype, "durationMinutes", void 0);
class PayForBookingDto {
    bookingId;
}
exports.PayForBookingDto = PayForBookingDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], PayForBookingDto.prototype, "bookingId", void 0);
class RequestPayoutDto {
    amount;
}
exports.RequestPayoutDto = RequestPayoutDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RequestPayoutDto.prototype, "amount", void 0);
class ListPaymentsQueryDto extends query_dto_1.PaginationQueryDto {
}
exports.ListPaymentsQueryDto = ListPaymentsQueryDto;
//# sourceMappingURL=payment.dto.js.map