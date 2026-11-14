"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoneClassroomProvider = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../common/exceptions/app.exception");
let NoneClassroomProvider = class NoneClassroomProvider {
    name = 'none';
    isEnabled() {
        return false;
    }
    async createSession(_request) {
        throw new app_exception_1.NotImplementedError('Live classroom provider');
    }
    async endSession(_bookingId) {
    }
    async getRecordingUrl(_bookingId) {
        return null;
    }
};
exports.NoneClassroomProvider = NoneClassroomProvider;
exports.NoneClassroomProvider = NoneClassroomProvider = __decorate([
    (0, common_1.Injectable)()
], NoneClassroomProvider);
//# sourceMappingURL=none-classroom.provider.js.map