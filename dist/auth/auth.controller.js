"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const common_2 = require("@nestjs/common");
const configuration_1 = require("../config/configuration");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const REFRESH_COOKIE = 'dialearn_rt';
let AuthController = class AuthController {
    auth;
    config;
    constructor(auth, config) {
        this.auth = auth;
        this.config = config;
    }
    async register(dto, request) {
        return this.auth.register(dto, this.contextOf(request));
    }
    async login(dto, request, response) {
        const issued = await this.auth.login(dto, this.contextOf(request));
        this.setRefreshCookie(response, issued.refreshToken, issued.refreshExpiresAt);
        return issued.session;
    }
    async refresh(dto, request, response) {
        const presented = this.readRefreshCookie(request) ?? dto.refreshToken;
        if (!presented) {
            this.clearRefreshCookie(response);
            throw new (await Promise.resolve().then(() => __importStar(require('../common/exceptions/app.exception')))).UnauthenticatedError('Your session has expired. Please sign in again.');
        }
        try {
            const issued = await this.auth.refresh(presented, this.contextOf(request));
            this.setRefreshCookie(response, issued.refreshToken, issued.refreshExpiresAt);
            return issued.session;
        }
        catch (error) {
            this.clearRefreshCookie(response);
            throw error;
        }
    }
    async logout(dto, request, response) {
        const presented = this.readRefreshCookie(request);
        const user = request.user;
        await this.auth.logout(presented, user?.id, dto.allDevices ?? false, this.contextOf(request));
        this.clearRefreshCookie(response);
    }
    async me(user) {
        return this.auth.currentUser(user.id);
    }
    async forgotPassword(dto, request) {
        await this.auth.requestPasswordReset(dto, this.contextOf(request));
        return { status: 'accepted' };
    }
    async resetPassword(dto, request) {
        await this.auth.resetPassword(dto, this.contextOf(request));
    }
    async changePassword(user, dto, request, response) {
        await this.auth.changePassword(user.id, dto, this.contextOf(request));
        this.clearRefreshCookie(response);
    }
    async verifyEmail(dto, request) {
        await this.auth.verifyEmail(dto.token, this.contextOf(request));
    }
    async resendVerification(dto, request) {
        await this.auth.resendVerification(dto.email, this.contextOf(request));
        return { status: 'accepted' };
    }
    contextOf(request) {
        const forwarded = request.headers['x-forwarded-for'];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() ||
            request.ip;
        return {
            ...(ip ? { ip } : {}),
            ...(request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {}),
            ...(request.requestId
                ? { requestId: request.requestId }
                : {}),
        };
    }
    setRefreshCookie(response, token, expiresAt) {
        response.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: this.config.cookieSecure,
            sameSite: this.config.cookieSameSite,
            ...(this.config.cookieDomain ? { domain: this.config.cookieDomain } : {}),
            path: '/',
            expires: expiresAt,
        });
    }
    readRefreshCookie(request) {
        const jar = request.cookies;
        return jar?.[REFRESH_COOKIE];
    }
    clearRefreshCookie(response) {
        response.clearCookie(REFRESH_COOKIE, {
            httpOnly: true,
            secure: this.config.cookieSecure,
            sameSite: this.config.cookieSameSite,
            ...(this.config.cookieDomain ? { domain: this.config.cookieDomain } : {}),
            path: '/',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LogoutDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('password/forgot'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('password/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 300_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('password/change'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('email/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('email/resend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 300_000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResendVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(1, (0, common_2.Inject)(configuration_1.authConfig.KEY)),
    __metadata("design:paramtypes", [auth_service_1.AuthService, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map