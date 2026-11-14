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
exports.ParentsService = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("../students/students.service");
const parents_repository_1 = require("./parents.repository");
let ParentsService = class ParentsService {
    repository;
    students;
    constructor(repository, students) {
        this.repository = repository;
        this.students = students;
    }
    async dashboard(userId) {
        return this.repository.dashboardSummary(userId);
    }
    async children(userId, query) {
        return this.students.list(userId, query);
    }
    async child(userId, studentId) {
        return this.students.findOne(userId, studentId);
    }
    async childProgress(userId, studentId) {
        return this.repository.childProgress(userId, studentId);
    }
};
exports.ParentsService = ParentsService;
exports.ParentsService = ParentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parents_repository_1.ParentsRepository,
        students_service_1.StudentsService])
], ParentsService);
//# sourceMappingURL=parents.service.js.map