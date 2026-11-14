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
var LocalDiskStorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDiskStorageProvider = void 0;
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_interface_1 = require("./storage.interface");
const INLINE_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'text/plain',
]);
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;
let LocalDiskStorageProvider = LocalDiskStorageProvider_1 = class LocalDiskStorageProvider {
    name = 'local';
    logger = new common_1.Logger(LocalDiskStorageProvider_1.name);
    root;
    signingKey;
    downloadBase;
    constructor(config) {
        const integrations = config.getOrThrow('integrations');
        const app = config.getOrThrow('app');
        this.root = (0, node_path_1.resolve)(integrations.storageLocalPath);
        this.signingKey = integrations.storageSigningSecret
            ? Buffer.from(integrations.storageSigningSecret)
            : (0, node_crypto_1.createHmac)('sha256', config.getOrThrow('jwt').secret)
                .update('dialearn.storage.signed-url.v1')
                .digest();
        this.downloadBase = `/${app.apiPrefix}/files/signed/`;
    }
    async upload(request) {
        const target = this.locate(request.bucket, request.path);
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(target), { recursive: true });
        await (0, promises_1.writeFile)(target, request.content, { flag: request.upsert ? 'w' : 'wx' });
        return {
            bucket: request.bucket,
            path: request.path,
            sizeBytes: request.content.length,
            contentType: request.contentType,
        };
    }
    async createSignedUrl(request) {
        this.locate(request.bucket, request.path);
        const payload = {
            b: request.bucket,
            p: request.path,
            e: Math.floor(Date.now() / 1000) + request.expiresInSeconds,
            t: request.contentType ?? null,
            n: request.downloadName ?? null,
        };
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        return `${this.downloadBase}${body}.${this.sign(body)}`;
    }
    async resolveSignedToken(token) {
        const [body, signature] = token.split('.');
        if (!body || !signature)
            return null;
        const expected = Buffer.from(this.sign(body));
        const given = Buffer.from(signature);
        if (expected.length !== given.length || !(0, node_crypto_1.timingSafeEqual)(expected, given))
            return null;
        let payload;
        try {
            payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        }
        catch {
            return null;
        }
        if (typeof payload.e !== 'number' || payload.e < Date.now() / 1000)
            return null;
        let absolutePath;
        try {
            absolutePath = this.locate(payload.b, payload.p);
            if (!(await (0, promises_1.stat)(absolutePath)).isFile())
                return null;
        }
        catch {
            return null;
        }
        const contentType = (payload.t ?? '').toLowerCase().split(';')[0].trim();
        const inline = INLINE_TYPES.has(contentType);
        return {
            absolutePath,
            contentType: inline ? contentType : 'application/octet-stream',
            downloadName: payload.n || payload.p.split('/').pop(),
            inline,
        };
    }
    async remove(bucket, paths) {
        for (const path of paths) {
            try {
                await (0, promises_1.unlink)(this.locate(bucket, path));
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.logger.warn(`Could not remove a stored file from ${bucket}`);
                }
            }
        }
    }
    locate(bucket, path) {
        if (!storage_interface_1.STORAGE_BUCKETS.includes(bucket)) {
            throw new Error('Unknown storage bucket.');
        }
        const segments = path.split('/');
        if (!segments.length || !segments.every((segment) => SEGMENT.test(segment))) {
            throw new Error('Invalid storage key.');
        }
        const absolute = (0, node_path_1.resolve)(this.root, bucket, ...segments);
        if (!absolute.startsWith((0, node_path_1.resolve)(this.root, bucket) + node_path_1.sep)) {
            throw new Error('Invalid storage key.');
        }
        return absolute;
    }
    sign(body) {
        return (0, node_crypto_1.createHmac)('sha256', this.signingKey).update(body).digest('base64url');
    }
};
exports.LocalDiskStorageProvider = LocalDiskStorageProvider;
exports.LocalDiskStorageProvider = LocalDiskStorageProvider = LocalDiskStorageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalDiskStorageProvider);
//# sourceMappingURL=local-disk-storage.provider.js.map