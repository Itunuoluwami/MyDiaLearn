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
exports.SearchQueryDto = exports.SortQueryDto = exports.PaginationQueryDto = void 0;
exports.resolveSort = resolveSort;
exports.paginate = paginate;
exports.paginateWithoutTotal = paginateWithoutTotal;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PaginationQueryDto {
    page = 1;
    limit = 25;
    get skip() {
        return (this.page - 1) * this.limit;
    }
}
exports.PaginationQueryDto = PaginationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], PaginationQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], PaginationQueryDto.prototype, "limit", void 0);
class SortQueryDto extends PaginationQueryDto {
    sortBy;
    sortDirection = 'desc';
}
exports.SortQueryDto = SortQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], SortQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], SortQueryDto.prototype, "sortDirection", void 0);
function resolveSort(requested, allowed, fallback) {
    return allowed.includes(requested) ? requested : fallback;
}
class SearchQueryDto extends SortQueryDto {
    q;
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "q", void 0);
function paginate(data, total, query) {
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    return {
        data,
        meta: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
            hasNext: query.page < totalPages,
        },
    };
}
function paginateWithoutTotal(rows, query) {
    const hasNext = rows.length > query.limit;
    return {
        data: hasNext ? rows.slice(0, query.limit) : rows,
        meta: { page: query.page, limit: query.limit, hasNext },
    };
}
//# sourceMappingURL=query.dto.js.map