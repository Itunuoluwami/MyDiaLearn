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
exports.ListMessagesQueryDto = exports.StartConversationDto = exports.SendMessageDto = void 0;
const class_validator_1 = require("class-validator");
const query_dto_1 = require("../../shared/query.dto");
class SendMessageDto {
    body;
    attachmentPath;
    attachmentName;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'A message cannot be empty.' }),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SendMessageDto.prototype, "attachmentPath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SendMessageDto.prototype, "attachmentName", void 0);
class StartConversationDto {
    studentId;
    subject;
}
exports.StartConversationDto = StartConversationDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], StartConversationDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], StartConversationDto.prototype, "subject", void 0);
class ListMessagesQueryDto extends query_dto_1.PaginationQueryDto {
}
exports.ListMessagesQueryDto = ListMessagesQueryDto;
//# sourceMappingURL=messaging.dto.js.map