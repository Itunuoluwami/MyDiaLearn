"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorsModule = void 0;
const common_1 = require("@nestjs/common");
const tutor_availability_repository_1 = require("./tutor-availability.repository");
const tutor_verification_repository_1 = require("./tutor-verification.repository");
const tutor_availability_service_1 = require("./services/tutor-availability.service");
const tutor_verification_service_1 = require("./services/tutor-verification.service");
const tutors_controller_1 = require("./tutors.controller");
const tutors_repository_1 = require("./tutors.repository");
const tutors_service_1 = require("./tutors.service");
let TutorsModule = class TutorsModule {
};
exports.TutorsModule = TutorsModule;
exports.TutorsModule = TutorsModule = __decorate([
    (0, common_1.Module)({
        controllers: [tutors_controller_1.TutorsController],
        providers: [
            tutors_repository_1.TutorsRepository,
            tutor_availability_repository_1.TutorAvailabilityRepository,
            tutor_verification_repository_1.TutorVerificationRepository,
            tutors_service_1.TutorsService,
            tutor_availability_service_1.TutorAvailabilityService,
            tutor_verification_service_1.TutorVerificationService,
        ],
        exports: [tutors_service_1.TutorsService, tutor_availability_service_1.TutorAvailabilityService, tutor_verification_service_1.TutorVerificationService],
    })
], TutorsModule);
//# sourceMappingURL=tutors.module.js.map