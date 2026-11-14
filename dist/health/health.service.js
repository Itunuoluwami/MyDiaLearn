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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../config/configuration");
const prisma_service_1 = require("../database/prisma.service");
let HealthService = class HealthService {
    prisma;
    app;
    integrations;
    startedAt = Date.now();
    constructor(prisma, app, integrations) {
        this.prisma = prisma;
        this.app = app;
        this.integrations = integrations;
    }
    async report() {
        const database = await this.checkDatabase();
        return {
            status: database.status === 'up' ? 'ok' : 'degraded',
            service: 'dialearn-backend',
            version: process.env.npm_package_version ?? '0.1.0',
            env: this.app.env,
            uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
            timestamp: new Date().toISOString(),
            checks: {
                database,
                integrations: {
                    email: { adapter: this.integrations.email, status: 'up' },
                    payment: { adapter: this.integrations.payment, status: 'up' },
                    storage: {
                        adapter: this.integrations.storage,
                        status: this.integrations.storage === 'unconfigured' ? 'not_configured' : 'up',
                    },
                    classroom: {
                        adapter: this.integrations.classroom,
                        status: this.integrations.classroom === 'none' ? 'not_configured' : 'up',
                    },
                },
            },
        };
    }
    async isReady() {
        return (await this.checkDatabase()).status === 'up';
    }
    async checkDatabase() {
        const startedAt = Date.now();
        try {
            await this.prisma.ping();
            return { status: 'up', latencyMs: Date.now() - startedAt };
        }
        catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.constructor.name : 'UnknownError',
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(configuration_1.appConfig.KEY)),
    __param(2, (0, common_1.Inject)(configuration_1.integrationsConfig.KEY)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, Object])
], HealthService);
//# sourceMappingURL=health.service.js.map