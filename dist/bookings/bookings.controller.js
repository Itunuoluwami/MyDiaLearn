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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../common/audit/request-context");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const bookings_service_1 = require("./bookings.service");
const booking_dto_1 = require("./dto/booking.dto");
let BookingsController = class BookingsController {
    bookings;
    constructor(bookings) {
        this.bookings = bookings;
    }
    async availableSlots(user, query) {
        return this.bookings.availableSlots(user.id, query);
    }
    async tutorSchedule(user, query) {
        return this.bookings.tutorSchedule(user.id, query);
    }
    async create(user, dto, request) {
        return this.bookings.create(user.id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async list(user, query) {
        return this.bookings.list(user.id, query);
    }
    myRatings(user) {
        return this.bookings.myRatings(user.id);
    }
    async findOne(user, id) {
        return this.bookings.findOne(user.id, id);
    }
    async respond(user, id, dto, request) {
        return this.bookings.respond(user.id, id, dto.accept, (0, request_context_1.auditContextOf)(request));
    }
    async rate(user, id, dto) {
        await this.bookings.rate(user.id, id, dto);
    }
    async cancelByFamily(user, id, dto, request) {
        await this.bookings.cancelByFamily(user.id, id, dto.reason, (0, request_context_1.auditContextOf)(request));
    }
    raiseDispute(user, id, dto, request) {
        return this.bookings.raiseDispute(user.id, id, dto, (0, request_context_1.auditContextOf)(request));
    }
    async openClass(user, id) {
        return this.bookings.openClass(user.id, id);
    }
    async joinClass(user, id) {
        return this.bookings.joinClass(user.id, id);
    }
    async startClass(user, id, request) {
        await this.bookings.startClass(user.id, id, (0, request_context_1.auditContextOf)(request));
    }
    async endClass(user, id, dto, request) {
        await this.bookings.endClass(user.id, id, dto.studentAttended, (0, request_context_1.auditContextOf)(request));
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)('available-slots'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.AvailableSlotsQueryDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "availableSlots", null);
__decorate([
    (0, common_1.Get)('tutor-schedule'),
    (0, roles_decorator_1.Roles)('tutor'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.TutorScheduleQueryDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "tutorSchedule", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.ListBookingsQueryDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('my-ratings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "myRatings", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.RespondBookingDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "respond", null);
__decorate([
    (0, common_1.Post)(':id/rating'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.RateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "rate", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.FamilyCancelDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelByFamily", null);
__decorate([
    (0, common_1.Post)(':id/disputes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.RaiseDisputeDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "raiseDispute", null);
__decorate([
    (0, common_1.Post)(':id/class/open'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "openClass", null);
__decorate([
    (0, common_1.Post)(':id/class/join'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "joinClass", null);
__decorate([
    (0, common_1.Post)(':id/class/start'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "startClass", null);
__decorate([
    (0, common_1.Post)(':id/class/end'),
    (0, roles_decorator_1.Roles)('tutor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.EndClassDto, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "endClass", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map