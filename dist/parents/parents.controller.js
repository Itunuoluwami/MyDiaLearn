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
exports.ParentsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const student_dto_1 = require("../students/dto/student.dto");
const parents_service_1 = require("./parents.service");
let ParentsController = class ParentsController {
    parents;
    constructor(parents) {
        this.parents = parents;
    }
    dashboard(user) {
        return this.parents.dashboard(user.id);
    }
    children(user, query) {
        return this.parents.children(user.id, query);
    }
    child(user, id) {
        return this.parents.child(user.id, id);
    }
    childProgress(user, id) {
        return this.parents.childProgress(user.id, id);
    }
};
exports.ParentsController = ParentsController;
__decorate([
    (0, common_1.Get)('me/dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('me/children'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, student_dto_1.ListStudentsQueryDto]),
    __metadata("design:returntype", Promise)
], ParentsController.prototype, "children", null);
__decorate([
    (0, common_1.Get)('me/children/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentsController.prototype, "child", null);
__decorate([
    (0, common_1.Get)('me/children/:id/progress'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentsController.prototype, "childProgress", null);
exports.ParentsController = ParentsController = __decorate([
    (0, common_1.Controller)('parents'),
    (0, roles_decorator_1.Roles)('parent'),
    __metadata("design:paramtypes", [parents_service_1.ParentsService])
], ParentsController);
//# sourceMappingURL=parents.controller.js.map