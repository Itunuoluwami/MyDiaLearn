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
exports.FilesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const teaching_repository_1 = require("../teaching/teaching.repository");
let FilesRepository = class FilesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ownTutorId(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.current_tutor_id() as id
      `;
            return rows[0]?.id ?? null;
        });
    }
    async tutorDocument(userId, documentId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select storage_path, mime_type, label as name
        from public.tutor_documents
        where id = ${documentId}::uuid
          and storage_path is not null and storage_path <> ''
          and (public.owns_tutor(tutor_id) or public.is_admin())
      `;
            return rows[0] ?? null;
        });
    }
    async learningResource(userId, resourceId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select storage_path, mime_type, title as name
        from public.learning_resources
        where id = ${resourceId}::uuid and storage_path is not null and ${teaching_repository_1.RESOURCE_VISIBLE}
      `;
            return rows[0] ?? null;
        });
    }
    async submission(userId, assignmentId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select submission_path as storage_path, null::text as mime_type, title as name
        from public.assignments
        where id = ${assignmentId}::uuid
          and submission_path is not null
          and (public.owns_tutor(tutor_id)
               or starts_with(submission_path, 'submissions/' || auth.uid()::text || '/'))
      `;
            return rows[0] ?? null;
        });
    }
};
exports.FilesRepository = FilesRepository;
exports.FilesRepository = FilesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesRepository);
//# sourceMappingURL=files.repository.js.map