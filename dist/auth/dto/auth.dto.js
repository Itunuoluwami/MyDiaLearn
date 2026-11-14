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
exports.LogoutDto = exports.ResendVerificationDto = exports.VerifyEmailDto = exports.ChangePasswordDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshDto = exports.RegisterDto = exports.LoginDto = void 0;
exports.passwordDecorators = passwordDecorators;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const PASSWORD_RULES = [
    [/[A-Z]/, 'Password must include an uppercase letter.'],
    [/[a-z]/, 'Password must include a lowercase letter.'],
    [/\d/, 'Password must include a number.'],
    [/[^A-Za-z0-9]/, 'Password must include a special character.'],
];
function passwordDecorators() {
    return [
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8, { message: 'Password must contain at least 8 characters.' }),
        (0, class_validator_1.MaxLength)(72, { message: 'Passwords can be at most 72 characters.' }),
        ...PASSWORD_RULES.map(([pattern, message]) => (0, class_validator_1.Matches)(pattern, { message })),
    ];
}
function Password() {
    const decorators = passwordDecorators();
    return (target, key) => decorators.forEach((d) => d(target, key));
}
const normalizeEmail = ({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value;
class LoginDto {
    email;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_transformer_1.Transform)(normalizeEmail),
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address.' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Please enter your password.' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
    email;
    password;
    fullName;
    firstName;
    lastName;
    phone;
    countryCode;
    timezone;
    role;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_transformer_1.Transform)(normalizeEmail),
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    Password(),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "countryCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], RegisterDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['parent', 'student', 'tutor', 'agency'], { message: 'Please choose a valid role.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class RefreshDto {
    refreshToken;
}
exports.RefreshDto = RefreshDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshDto.prototype, "refreshToken", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_transformer_1.Transform)(normalizeEmail),
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address.' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    password;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    Password(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    Password(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class VerifyEmailDto {
    token;
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
class ResendVerificationDto {
    email;
}
exports.ResendVerificationDto = ResendVerificationDto;
__decorate([
    (0, class_transformer_1.Transform)(normalizeEmail),
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address.' }),
    __metadata("design:type", String)
], ResendVerificationDto.prototype, "email", void 0);
class LogoutDto {
    allDevices;
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LogoutDto.prototype, "allDevices", void 0);
//# sourceMappingURL=auth.dto.js.map