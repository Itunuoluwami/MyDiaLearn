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
exports.CatalogueController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const catalogue_service_1 = require("./catalogue.service");
const catalogue_dto_1 = require("./dto/catalogue.dto");
let CatalogueController = class CatalogueController {
    catalogue;
    constructor(catalogue) {
        this.catalogue = catalogue;
    }
    subjects() {
        return this.catalogue.subjects();
    }
    curricula() {
        return this.catalogue.curricula();
    }
    countries() {
        return this.catalogue.countries();
    }
    educationLevels() {
        return this.catalogue.educationLevels();
    }
    settings() {
        return this.catalogue.publicSettings();
    }
    cancellationPolicies() {
        return this.catalogue.cancellationPolicies();
    }
    verificationSteps() {
        return this.catalogue.verificationSteps();
    }
    commissionExample() {
        return this.catalogue.commissionExample();
    }
    currencies() {
        return this.catalogue.currencies();
    }
    suggestions(query) {
        return this.catalogue.suggestions(query.q, query.limit);
    }
    searchTutors(query) {
        return this.catalogue.searchTutors(query);
    }
    tutorCards(dto) {
        return this.catalogue.tutorCards(dto.ids);
    }
    tutorDetail(id) {
        return this.catalogue.tutorDetail(id);
    }
    tutorSubjects(id) {
        return this.catalogue.tutorSubjects(id);
    }
    tutorReviews(id, query) {
        return this.catalogue.tutorReviews(id, query.limit);
    }
};
exports.CatalogueController = CatalogueController;
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "subjects", null);
__decorate([
    (0, common_1.Get)('curricula'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "curricula", null);
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "countries", null);
__decorate([
    (0, common_1.Get)('education-levels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "educationLevels", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "settings", null);
__decorate([
    (0, common_1.Get)('cancellation-policies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "cancellationPolicies", null);
__decorate([
    (0, common_1.Get)('verification-steps'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "verificationSteps", null);
__decorate([
    (0, common_1.Get)('commission-example'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "commissionExample", null);
__decorate([
    (0, common_1.Get)('currencies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "currencies", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalogue_dto_1.SearchSuggestionsQueryDto]),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "suggestions", null);
__decorate([
    (0, common_1.Get)('tutors'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalogue_dto_1.TutorSearchQueryDto]),
    __metadata("design:returntype", void 0)
], CatalogueController.prototype, "searchTutors", null);
__decorate([
    (0, common_1.Post)('tutors/cards'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [catalogue_dto_1.TutorCardsQueryDto]),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "tutorCards", null);
__decorate([
    (0, common_1.Get)('tutors/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "tutorDetail", null);
__decorate([
    (0, common_1.Get)('tutors/:id/subjects'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "tutorSubjects", null);
__decorate([
    (0, common_1.Get)('tutors/:id/reviews'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, catalogue_dto_1.TutorReviewsQueryDto]),
    __metadata("design:returntype", Promise)
], CatalogueController.prototype, "tutorReviews", null);
exports.CatalogueController = CatalogueController = __decorate([
    (0, common_1.Controller)('catalogue'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [catalogue_service_1.CatalogueService])
], CatalogueController);
//# sourceMappingURL=catalogue.controller.js.map