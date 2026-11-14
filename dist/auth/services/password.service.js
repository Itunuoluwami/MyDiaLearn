"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const argon2_1 = require("@node-rs/argon2");
const node_crypto_1 = require("node:crypto");
let PasswordService = class PasswordService {
    async hash(plain) {
        return (0, argon2_1.hash)(plain);
    }
    async verify(storedHash, plain) {
        if (!storedHash)
            return false;
        try {
            return await (0, argon2_1.verify)(storedHash, plain);
        }
        catch {
            return false;
        }
    }
    async dummyVerify() {
        await (0, argon2_1.verify)('$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$8kDMtKRrfPnSMTtWDNQb7ZcBDh1Tp5Rot1YNu+jVkEA', 'not-a-real-password').catch(() => false);
    }
    createToken() {
        return (0, node_crypto_1.randomBytes)(32).toString('base64url');
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    safeEquals(a, b) {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(bufA, bufB);
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)()
], PasswordService);
//# sourceMappingURL=password.service.js.map