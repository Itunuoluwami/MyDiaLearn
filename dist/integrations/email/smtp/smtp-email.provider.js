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
var SmtpEmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpEmailProvider = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const nodemailer = __importStar(require("nodemailer"));
const configuration_1 = require("../../../config/configuration");
const email_errors_1 = require("../email.errors");
const CONNECTION_TIMEOUT_MS = 10_000;
const GREETING_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 20_000;
let SmtpEmailProvider = SmtpEmailProvider_1 = class SmtpEmailProvider {
    config;
    logger;
    name = 'smtp';
    transporter;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.logger.setContext(SmtpEmailProvider_1.name);
        for (const warning of this.configurationWarnings()) {
            this.logger.warn({ warning }, 'SMTP configuration looks wrong');
        }
    }
    isConfigured() {
        return Boolean(this.config.host && this.config.fromEmail);
    }
    configurationWarnings() {
        const warnings = [];
        if (!this.config.host)
            warnings.push('SMTP_HOST is not set.');
        if (!this.config.fromEmail)
            warnings.push('SMTP_FROM_EMAIL is not set.');
        if (this.config.host && !this.config.user) {
            warnings.push('SMTP_USER is not set; the server will be contacted unauthenticated.');
        }
        if (this.config.port === 587 && this.config.secure) {
            warnings.push('SMTP_PORT=587 with SMTP_SECURE=true: port 587 expects STARTTLS, so SMTP_SECURE should be false. ' +
                'As configured the connection will hang until it times out.');
        }
        if (this.config.port === 465 && !this.config.secure) {
            warnings.push('SMTP_PORT=465 with SMTP_SECURE=false: port 465 expects implicit TLS.');
        }
        if (!this.config.secure &&
            !this.config.requireTls &&
            this.config.authMethod !== 'CRAM-MD5') {
            warnings.push('A non-TLS port (SMTP_REQUIRE_TLS=false) without SMTP_AUTH_METHOD=CRAM-MD5 sends the ' +
                'password base64-encoded in clear. Prefer 587 with STARTTLS, or set CRAM-MD5.');
        }
        return warnings;
    }
    async send(message) {
        if (!this.isConfigured()) {
            throw new Error('SMTP is selected but not configured. Set SMTP_HOST and SMTP_FROM_EMAIL, ' +
                'or set EMAIL_PROVIDER=log.');
        }
        const info = await this.transport().sendMail({
            from: { name: this.config.fromName, address: this.config.fromEmail },
            to: message.to,
            subject: message.subject,
            ...(message.text !== undefined && { text: message.text }),
            ...(message.html !== undefined && { html: message.html }),
            ...(message.replyTo !== undefined && { replyTo: message.replyTo }),
            ...(message.cc !== undefined && { cc: message.cc }),
            ...(message.bcc !== undefined && { bcc: message.bcc }),
            ...(message.headers !== undefined && { headers: message.headers }),
        });
        return {
            messageId: info.messageId,
            accepted: (info.accepted ?? []).map(String),
            rejected: (info.rejected ?? []).map(String),
            provider: this.name,
            attempts: 1,
        };
    }
    async verifyConnection() {
        const base = {
            status: 'not_configured',
            provider: this.name,
            host: this.config.host || undefined,
            port: this.config.port,
            secure: this.config.secure,
            warnings: this.configurationWarnings(),
        };
        if (!this.isConfigured()) {
            return { ...base, detail: 'SMTP_HOST or SMTP_FROM_EMAIL is not set.' };
        }
        const startedAt = Date.now();
        try {
            await this.transport().verify();
            return {
                ...base,
                status: 'ok',
                latencyMs: Date.now() - startedAt,
                detail: 'Connected and authenticated.',
            };
        }
        catch (error) {
            const classified = (0, email_errors_1.classifyEmailError)(error);
            this.logger.error({ kind: classified.kind, host: this.config.host, port: this.config.port }, 'SMTP verification failed');
            return {
                ...base,
                status: classified.kind === 'authentication' ? 'unauthenticated' : 'unreachable',
                latencyMs: Date.now() - startedAt,
                detail: classified.summary,
            };
        }
    }
    async onModuleDestroy() {
        this.transporter?.close();
    }
    transport() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                ...(this.config.secure ? {} : { requireTLS: this.config.requireTls }),
                ...(this.config.authMethod ? { authMethod: this.config.authMethod } : {}),
                pool: true,
                maxConnections: 3,
                maxMessages: 50,
                connectionTimeout: CONNECTION_TIMEOUT_MS,
                greetingTimeout: GREETING_TIMEOUT_MS,
                socketTimeout: SOCKET_TIMEOUT_MS,
                ...(this.config.user
                    ? { auth: { user: this.config.user, pass: this.config.password } }
                    : {}),
            });
        }
        return this.transporter;
    }
};
exports.SmtpEmailProvider = SmtpEmailProvider;
exports.SmtpEmailProvider = SmtpEmailProvider = SmtpEmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(configuration_1.smtpConfig.KEY)),
    __metadata("design:paramtypes", [Object, nestjs_pino_1.PinoLogger])
], SmtpEmailProvider);
//# sourceMappingURL=smtp-email.provider.js.map