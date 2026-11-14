"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenciesModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const files_module_1 = require("../files/files.module");
const tutors_module_1 = require("../tutors/tutors.module");
const agencies_controller_1 = require("./agencies.controller");
const agencies_repository_1 = require("./agencies.repository");
const agencies_service_1 = require("./agencies.service");
let AgenciesModule = class AgenciesModule {
};
exports.AgenciesModule = AgenciesModule;
exports.AgenciesModule = AgenciesModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, tutors_module_1.TutorsModule, files_module_1.FilesModule],
        controllers: [agencies_controller_1.AgenciesController],
        providers: [agencies_repository_1.AgenciesRepository, agencies_service_1.AgenciesService],
    })
], AgenciesModule);
//# sourceMappingURL=agencies.module.js.map