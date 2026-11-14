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
exports.TutorAvailabilityRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const base_repository_1 = require("../database/repositories/base.repository");
let TutorAvailabilityRepository = class TutorAvailabilityRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async listPublic(tutorId) {
        return this.prisma.asAnonymous(async (tx) => tx.$queryRaw `
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid and is_active
        order by day_of_week, start_time
      `);
    }
    async list(userId, tutorId) {
        return this.prisma.withUser(userId, async (tx) => tx.$queryRaw `
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid
        order by day_of_week, start_time
      `);
    }
    async addAvailabilityWindow(userId, tutorId, input) {
        return this.prisma.withUser(userId, async (tx) => {
            const rows = await tx.$queryRaw `
        insert into public.availability_windows (tutor_id, day_of_week, start_time, end_time, timezone)
        values (${tutorId}::uuid, ${input.dayOfWeek}, ${input.startTime}::time,
                ${input.endTime}::time, ${input.timezone})
        returning id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
      `;
            return rows[0];
        });
    }
    async updateAvailabilityWindow(userId, id, isActive) {
        const n = await this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        update public.availability_windows set is_active = ${isActive}, updated_at = now()
        where id = ${id}::uuid and tutor_id = public.current_tutor_id()
      `);
        return n > 0;
    }
    async deleteAvailabilityWindow(userId, id) {
        const n = await this.prisma.withUser(userId, async (tx) => tx.$executeRaw `
        delete from public.availability_windows
        where id = ${id}::uuid and tutor_id = public.current_tutor_id()
      `);
        return n > 0;
    }
    async replaceAll(userId, tutorId, windows) {
        return this.prisma.withUser(userId, async (tx) => {
            await tx.$executeRaw `
        delete from public.availability_windows where tutor_id = ${tutorId}::uuid
      `;
            for (const window of windows) {
                await tx.$executeRaw `
          insert into public.availability_windows
            (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
          values (
            ${tutorId}::uuid, ${window.dayOfWeek},
            ${window.startTime}::time, ${window.endTime}::time,
            ${window.timezone}, ${window.isActive ?? true}
          )
        `;
            }
            return tx.$queryRaw `
        select id, tutor_id, day_of_week, start_time::text, end_time::text, timezone, is_active
        from public.availability_windows
        where tutor_id = ${tutorId}::uuid
        order by day_of_week, start_time
      `;
        });
    }
};
exports.TutorAvailabilityRepository = TutorAvailabilityRepository;
exports.TutorAvailabilityRepository = TutorAvailabilityRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TutorAvailabilityRepository);
//# sourceMappingURL=tutor-availability.repository.js.map