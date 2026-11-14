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
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const rxjs_1 = require("rxjs");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        if (context.getType() !== 'http')
            return next.handle();
        const request = context.switchToHttp().getRequest();
        const handler = `${context.getClass().name}.${context.getHandler().name}`;
        const startedAt = process.hrtime.bigint();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => this.record(request, handler, startedAt, 'ok'),
            error: () => this.record(request, handler, startedAt, 'error'),
        }));
    }
    record(request, handler, startedAt, outcome) {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        this.logger.debug({
            requestId: request.requestId,
            handler,
            method: request.method,
            path: request.originalUrl ?? request.url,
            userId: request.user?.id,
            durationMs: Number(durationMs.toFixed(2)),
            outcome,
        }, 'request handled');
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map