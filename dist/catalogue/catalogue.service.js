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
exports.CatalogueService = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../common/exceptions/app.exception");
const query_dto_1 = require("../shared/query.dto");
const catalogue_repository_1 = require("./catalogue.repository");
let CatalogueService = class CatalogueService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    subjects() {
        return this.repository.subjects();
    }
    curricula() {
        return this.repository.curricula();
    }
    countries() {
        return this.repository.countries();
    }
    educationLevels() {
        return this.repository.educationLevels();
    }
    currencies() {
        return this.repository.currencies();
    }
    suggestions(q, limit) {
        if (!q)
            return Promise.resolve([]);
        return this.repository.searchSuggestions(q, limit);
    }
    async searchTutors(query) {
        const rows = await this.repository.searchTutors({
            q: query.q,
            subjectId: query.subjectId,
            curriculumId: query.curriculumId,
            country: query.country,
            educationLevelId: query.educationLevelId,
            language: query.language,
            minRating: query.minRating,
            maxPrice: query.maxPrice,
            sort: query.sort,
            limit: query.limit + 1,
            offset: query.skip,
        });
        return (0, query_dto_1.paginateWithoutTotal)(rows, query);
    }
    tutorSubjects(tutorId) {
        return this.repository.tutorSubjects(tutorId);
    }
    async tutorDetail(tutorId) {
        const tutor = await this.repository.tutorDetail(tutorId);
        if (!tutor)
            throw new app_exception_1.NotFoundError('Tutor');
        return tutor;
    }
    tutorReviews(tutorId, limit) {
        return this.repository.tutorReviews(tutorId, limit);
    }
    publicSettings() {
        return this.repository.publicSettings();
    }
    cancellationPolicies() {
        return this.repository.cancellationPolicies();
    }
    verificationSteps() {
        return this.repository.verificationSteps();
    }
    commissionExample() {
        return this.repository.commissionExample();
    }
    tutorCards(ids) {
        if (!ids.length)
            return Promise.resolve([]);
        return this.repository.tutorCards(ids);
    }
};
exports.CatalogueService = CatalogueService;
exports.CatalogueService = CatalogueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalogue_repository_1.CatalogueRepository])
], CatalogueService);
//# sourceMappingURL=catalogue.service.js.map