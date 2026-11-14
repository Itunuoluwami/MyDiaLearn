"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const refresh_token_repository_1 = require("../database/repositories/refresh-token.repository");
const user_repository_1 = require("../database/repositories/user.repository");
const verification_token_repository_1 = require("../database/repositories/verification-token.repository");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const password_service_1 = require("./services/password.service");
const token_service_1 = require("./services/token.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [passport_1.PassportModule.register({ defaultStrategy: 'jwt', session: false })],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            token_service_1.TokenService,
            password_service_1.PasswordService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            user_repository_1.UserRepository,
            refresh_token_repository_1.RefreshTokenRepository,
            verification_token_repository_1.VerificationTokenRepository,
        ],
        exports: [auth_service_1.AuthService, token_service_1.TokenService, password_service_1.PasswordService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map