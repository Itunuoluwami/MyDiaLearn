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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const nestjs_pino_1 = require("nestjs-pino");
const configuration_1 = require("../config/configuration");
const TRANSACTION_MAX_WAIT_MS = 10_000;
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    app;
    logger;
    connected = false;
    restricted;
    constructor(database, app, logger) {
        super({ adapter: new adapter_pg_1.PrismaPg(PrismaService_1.poolOptions(database.url)) });
        this.app = app;
        this.logger = logger;
        this.restricted = database.appUrl
            ? new client_1.PrismaClient({
                adapter: new adapter_pg_1.PrismaPg(PrismaService_1.poolOptions(database.appUrl)),
            })
            : null;
        this.logger.setContext(PrismaService_1.name);
    }
    static poolOptions(connectionString) {
        return { connectionString, keepAlive: true, options: '-c timezone=UTC' };
    }
    async onModuleInit() {
        try {
            await this.$connect();
            await this.ping();
            if (this.restricted) {
                await this.restricted.$queryRaw `SELECT 1`;
                this.logger.info('Restricted database login verified; row-level security applies');
            }
            this.connected = true;
            this.logger.info('Database connection verified');
        }
        catch (error) {
            this.connected = false;
            if (this.app.isProduction) {
                this.logger.error({ err: error }, 'Database unreachable; refusing to start');
                throw error;
            }
            this.logger.warn({ err: error }, 'Database unreachable. Starting anyway because APP_ENV is not production — ' +
                'database-backed routes will fail and /health will report db: down.');
        }
    }
    async onModuleDestroy() {
        await Promise.all([this.$disconnect(), this.restricted?.$disconnect()]);
    }
    usesRestrictedLogin() {
        return this.restricted !== null;
    }
    isConnected() {
        return this.connected;
    }
    async ping() {
        await this.$queryRaw `SELECT 1`;
    }
    async withUser(userId, fn, options) {
        const claims = JSON.stringify({
            sub: userId,
            role: options?.role ?? 'authenticated',
        });
        return (this.restricted ?? this).$transaction(async (tx) => {
            await tx.$executeRaw `select set_config('request.jwt.claims', ${claims}, true)`;
            return fn(tx);
        }, { timeout: options?.timeoutMs ?? 15_000, maxWait: TRANSACTION_MAX_WAIT_MS });
    }
    async asAnonymous(fn) {
        return (this.restricted ?? this).$transaction(async (tx) => {
            await tx.$executeRaw `select set_config('request.jwt.claims', '', true)`;
            return fn(tx);
        }, { maxWait: TRANSACTION_MAX_WAIT_MS });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(configuration_1.databaseConfig.KEY)),
    __param(1, (0, common_1.Inject)(configuration_1.appConfig.KEY)),
    __metadata("design:paramtypes", [Object, Object, nestjs_pino_1.PinoLogger])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map