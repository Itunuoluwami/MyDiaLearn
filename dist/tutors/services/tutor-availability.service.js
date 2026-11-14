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
exports.TutorAvailabilityService = void 0;
exports.toResponse = toResponse;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../common/exceptions/app.exception");
const tutor_availability_repository_1 = require("../tutor-availability.repository");
const tutors_repository_1 = require("../tutors.repository");
let TutorAvailabilityService = class TutorAvailabilityService {
    repository;
    tutors;
    constructor(repository, tutors) {
        this.repository = repository;
        this.tutors = tutors;
    }
    async listOwn(userId) {
        const tutor = await this.tutors.ensureOwn(userId);
        const rows = await this.repository.list(userId, tutor.id);
        return rows.map(toResponse);
    }
    async listPublic(tutorId) {
        const rows = await this.repository.listPublic(tutorId);
        return rows.map(toResponse);
    }
    async addWindow(userId, input) {
        assertOrdered({ ...input, timezone: '' });
        const tutor = await this.tutors.ensureOwn(userId);
        const row = await this.repository.addAvailabilityWindow(userId, tutor.id, {
            ...input,
            timezone: tutor.timezone,
        });
        return toResponse(row);
    }
    async setWindowActive(userId, id, isActive) {
        const ok = await this.repository.updateAvailabilityWindow(userId, id, isActive);
        if (!ok)
            throw new app_exception_1.NotFoundError('Availability window');
    }
    async deleteWindow(userId, id) {
        const ok = await this.repository.deleteAvailabilityWindow(userId, id);
        if (!ok)
            throw new app_exception_1.NotFoundError('Availability window');
    }
    async replaceOwn(userId, windows) {
        for (const window of windows) {
            assertOrdered(window);
        }
        const tutor = await this.tutors.ensureOwn(userId);
        const rows = await this.repository.replaceAll(userId, tutor.id, windows);
        return rows.map(toResponse);
    }
};
exports.TutorAvailabilityService = TutorAvailabilityService;
exports.TutorAvailabilityService = TutorAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tutor_availability_repository_1.TutorAvailabilityRepository,
        tutors_repository_1.TutorsRepository])
], TutorAvailabilityService);
function assertOrdered(window) {
    const start = normalise(window.startTime);
    const end = normalise(window.endTime);
    if (end <= start) {
        throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, `Availability must end after it starts (${window.startTime}–${window.endTime}).`, 400, { dayOfWeek: window.dayOfWeek });
    }
}
function normalise(time) {
    return time.length === 5 ? `${time}:00` : time;
}
function toResponse(row) {
    return {
        id: row.id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        timezone: row.timezone,
        isActive: row.is_active,
    };
}
//# sourceMappingURL=tutor-availability.service.js.map