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
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const app_exception_1 = require("../exceptions/app.exception");
const request_id_middleware_1 = require("../middleware/request-id.middleware");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.requestId ??
            response.getHeader(request_id_middleware_1.REQUEST_ID_HEADER) ??
            'unknown';
        const { status, code, message, details } = this.describe(exception);
        const body = {
            statusCode: status,
            code,
            message,
            requestId,
            timestamp: new Date().toISOString(),
            path: request.originalUrl ?? request.url,
            ...(details !== undefined && { details }),
        };
        if (status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error({ err: exception, requestId, path: body.path, code }, 'Unhandled exception');
        }
        else {
            this.logger.warn({ requestId, path: body.path, code, status }, message);
        }
        response.status(status).json(body);
    }
    describe(exception) {
        if (exception instanceof app_exception_1.AppException) {
            return {
                status: exception.getStatus(),
                code: exception.code,
                message: this.messageOf(exception),
                details: exception.details,
            };
        }
        if (exception instanceof throttler_1.ThrottlerException) {
            return {
                status: common_1.HttpStatus.TOO_MANY_REQUESTS,
                code: app_exception_1.ErrorCode.RATE_LIMITED,
                message: 'Too many requests. Please slow down.',
            };
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const payload = exception.getResponse();
            if (typeof payload === 'object' && payload !== null) {
                const { message, error } = payload;
                if (Array.isArray(message)) {
                    return {
                        status,
                        code: app_exception_1.ErrorCode.VALIDATION_FAILED,
                        message: 'Request validation failed.',
                        details: message,
                    };
                }
                return {
                    status,
                    code: this.codeForStatus(status),
                    message: typeof message === 'string'
                        ? message
                        : typeof error === 'string'
                            ? error
                            : exception.message,
                };
            }
            return {
                status,
                code: this.codeForStatus(status),
                message: typeof payload === 'string' ? payload : exception.message,
            };
        }
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            code: app_exception_1.ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred.',
        };
    }
    messageOf(exception) {
        const payload = exception.getResponse();
        if (typeof payload === 'object' && payload !== null) {
            const { message } = payload;
            if (typeof message === 'string')
                return message;
        }
        return exception.message;
    }
    codeForStatus(status) {
        switch (status) {
            case common_1.HttpStatus.UNAUTHORIZED:
                return app_exception_1.ErrorCode.UNAUTHENTICATED;
            case common_1.HttpStatus.FORBIDDEN:
                return app_exception_1.ErrorCode.NOT_AUTHORIZED;
            case common_1.HttpStatus.NOT_FOUND:
                return app_exception_1.ErrorCode.NOT_FOUND;
            case common_1.HttpStatus.CONFLICT:
                return app_exception_1.ErrorCode.CONFLICT;
            case common_1.HttpStatus.BAD_REQUEST:
                return app_exception_1.ErrorCode.VALIDATION_FAILED;
            case common_1.HttpStatus.NOT_IMPLEMENTED:
                return app_exception_1.ErrorCode.NOT_IMPLEMENTED;
            default:
                return status >= 500 ? app_exception_1.ErrorCode.INTERNAL_ERROR : 'HTTP_ERROR';
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map