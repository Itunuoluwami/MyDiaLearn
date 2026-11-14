"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnconfiguredStorageProvider = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../../common/exceptions/app.exception");
let UnconfiguredStorageProvider = class UnconfiguredStorageProvider {
    name = 'unconfigured';
    async upload(_request) {
        throw new app_exception_1.NotImplementedError('File storage');
    }
    async createSignedUrl(_request) {
        throw new app_exception_1.NotImplementedError('File storage');
    }
    async remove(_bucket, _paths) {
        throw new app_exception_1.NotImplementedError('File storage');
    }
};
exports.UnconfiguredStorageProvider = UnconfiguredStorageProvider;
exports.UnconfiguredStorageProvider = UnconfiguredStorageProvider = __decorate([
    (0, common_1.Injectable)()
], UnconfiguredStorageProvider);
//# sourceMappingURL=unconfigured-storage.provider.js.map