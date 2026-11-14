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
exports.TutorVerificationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let TutorVerificationRepository = class TutorVerificationRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async steps(userId, tutorId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select vs.id, vs.name, vs.code, vs.description, vs.is_required, vs.sort_order,
               tvp.status::text as status, tvp.reviewer_notes, tvp.reviewed_at
        from public.verification_steps vs
        left join public.tutor_verification_progress tvp
          on tvp.step_id = vs.id and tvp.tutor_id = ${tutorId}::uuid
        where vs.is_active and vs.applies_to = 'tutor'
        order by vs.sort_order, vs.name
      `);
    }
    async documents(userId, tutorId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select id, tutor_id, step_id, label, storage_path, mime_type, size_bytes,
               status::text, reviewer_notes, reviewed_at, created_at
        from public.tutor_documents
        where tutor_id = ${tutorId}::uuid
        order by created_at desc
      `);
    }
    async addDocument(userId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        insert into public.tutor_documents
          (tutor_id, step_id, label, storage_path, mime_type, size_bytes)
        values (
          ${input.tutorId}::uuid, ${input.stepId ?? null}::uuid, ${input.label},
          ${input.storagePath}, ${input.mimeType ?? null}, ${input.sizeBytes ?? null}
        )
        returning id, tutor_id, step_id, label, storage_path, mime_type, size_bytes,
                  status::text, reviewer_notes, reviewed_at, created_at
      `;
            return rows[0];
        });
    }
    async removeDocument(userId, documentId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        delete from public.tutor_documents
        where id = ${documentId}::uuid and public.owns_tutor(tutor_id)
        returning storage_path
      `;
            return rows[0]?.storage_path ?? null;
        });
    }
    async submit(userId) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        select public.tutor_submit_verification()::text as status
      `;
            return rows[0].status;
        });
    }
};
exports.TutorVerificationRepository = TutorVerificationRepository;
exports.TutorVerificationRepository = TutorVerificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TutorVerificationRepository);
//# sourceMappingURL=tutor-verification.repository.js.map