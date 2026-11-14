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
exports.FilesService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../common/exceptions/app.exception");
const common_2 = require("@nestjs/common");
const storage_interface_1 = require("../integrations/storage/storage.interface");
const files_repository_1 = require("./files.repository");
const LINK_TTL_SECONDS = 120;
const BUCKET = {
    'tutor-document': 'tutor-documents',
    'learning-resource': 'learning-resources',
    submission: 'learning-resources',
};
let FilesService = class FilesService {
    repository;
    storage;
    constructor(repository, storage) {
        this.repository = repository;
        this.storage = storage;
    }
    async upload(userId, kind, file) {
        if (!file || !file.size) {
            throw new app_exception_1.AppException(app_exception_1.ErrorCode.VALIDATION_FAILED, 'Choose a file to upload.', common_2.HttpStatus.BAD_REQUEST);
        }
        let folder;
        if (kind === 'submission') {
            folder = `submissions/${userId}`;
        }
        else {
            const tutorId = await this.repository.ownTutorId(userId);
            if (!tutorId)
                throw new app_exception_1.NotFoundError('Tutor profile');
            folder = tutorId;
        }
        const storagePath = `${folder}/${(0, node_crypto_1.randomUUID)()}.${extensionOf(file.originalname)}`;
        const mimeType = file.mimetype || null;
        await this.storage.upload({
            bucket: BUCKET[kind],
            path: storagePath,
            content: file.buffer,
            contentType: mimeType ?? 'application/octet-stream',
        });
        return { storagePath, mimeType, sizeBytes: file.size };
    }
    tutorDocumentUrl(userId, id) {
        return this.sign('tutor-documents', this.repository.tutorDocument(userId, id));
    }
    learningResourceUrl(userId, id) {
        return this.sign('learning-resources', this.repository.learningResource(userId, id));
    }
    submissionUrl(userId, assignmentId) {
        return this.sign('learning-resources', this.repository.submission(userId, assignmentId));
    }
    async resolve(token) {
        const download = await this.storage.resolveSignedToken?.(token);
        if (!download)
            throw new app_exception_1.NotFoundError('File');
        return download;
    }
    async sign(bucket, lookup) {
        const row = await lookup;
        if (!row)
            throw new app_exception_1.NotFoundError('File');
        const url = await this.storage.createSignedUrl({
            bucket,
            path: row.storage_path,
            expiresInSeconds: LINK_TTL_SECONDS,
            contentType: row.mime_type,
            downloadName: downloadName(row),
        });
        return { url };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [files_repository_1.FilesRepository, Object])
], FilesService);
function extensionOf(name) {
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    return /^[a-z0-9]{1,10}$/.test(extension) ? extension : 'bin';
}
function downloadName(row) {
    const extension = row.storage_path.split('.').pop() ?? 'bin';
    const base = (row.name ?? 'file')
        .replace(/[^A-Za-z0-9 ._-]+/g, '')
        .trim()
        .slice(0, 80) || 'file';
    return base.toLowerCase().endsWith(`.${extension}`) ? base : `${base}.${extension}`;
}
//# sourceMappingURL=files.service.js.map