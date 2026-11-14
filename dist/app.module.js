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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const node_crypto_1 = require("node:crypto");
const config_module_1 = require("./config/config.module");
const configuration_1 = require("./config/configuration");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const audit_module_1 = require("./common/audit/audit.module");
const database_module_1 = require("./database/database.module");
const integrations_module_1 = require("./integrations/integrations.module");
const health_module_1 = require("./health/health.module");
const platform_settings_module_1 = require("./platform-settings/platform-settings.module");
const admin_module_1 = require("./admin/admin.module");
const agencies_module_1 = require("./agencies/agencies.module");
const auth_module_1 = require("./auth/auth.module");
const bookings_module_1 = require("./bookings/bookings.module");
const catalogue_module_1 = require("./catalogue/catalogue.module");
const messaging_module_1 = require("./messaging/messaging.module");
const teaching_module_1 = require("./teaching/teaching.module");
const files_module_1 = require("./files/files.module");
const notifications_module_1 = require("./notifications/notifications.module");
const parents_module_1 = require("./parents/parents.module");
const payments_module_1 = require("./payments/payments.module");
const students_module_1 = require("./students/students.module");
const tutors_module_1 = require("./tutors/tutors.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
    app;
    integrations;
    constructor(app, integrations) {
        this.app = app;
        this.integrations = integrations;
    }
    onModuleInit() {
        if (this.app.isProduction && this.integrations.payment === 'simulated') {
            throw new Error('PAYMENT_PROVIDER=simulated is not permitted when APP_ENV=production. ' +
                'Configure a real payment provider before deploying.');
        }
    }
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('{*path}');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.AppConfigModule,
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [configuration_1.appConfig.KEY],
                useFactory: (app) => ({
                    pinoHttp: {
                        level: app.logLevel,
                        genReqId: (req, res) => {
                            const existing = req.headers[request_id_middleware_1.REQUEST_ID_HEADER];
                            const id = (Array.isArray(existing) ? existing[0] : existing) || (0, node_crypto_1.randomUUID)();
                            res.setHeader(request_id_middleware_1.REQUEST_ID_HEADER, id);
                            return id;
                        },
                        redact: {
                            paths: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'res.headers["set-cookie"]',
                                'req.body.password',
                                'req.body.confirmPassword',
                                'req.body.otp',
                            ],
                            remove: true,
                        },
                        autoLogging: {
                            ignore: (req) => req.url?.startsWith('/health') ?? false,
                        },
                        ...(app.env !== 'development' && app.env !== 'test'
                            ? {}
                            : { transport: { target: 'pino-pretty', options: { singleLine: true } } }),
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [configuration_1.rateLimitConfig.KEY],
                useFactory: (limits) => ({
                    throttlers: [{ ttl: limits.ttlSeconds * 1000, limit: limits.max }],
                }),
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [configuration_1.jwtConfig.KEY],
                useFactory: (jwt) => ({
                    secret: jwt.secret,
                    signOptions: { expiresIn: jwt.accessExpiresIn },
                }),
            }),
            database_module_1.DatabaseModule,
            audit_module_1.AuditModule,
            integrations_module_1.IntegrationsModule,
            platform_settings_module_1.PlatformSettingsModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            catalogue_module_1.CatalogueModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            bookings_module_1.BookingsModule,
            tutors_module_1.TutorsModule,
            students_module_1.StudentsModule,
            parents_module_1.ParentsModule,
            messaging_module_1.MessagingModule,
            teaching_module_1.TeachingModule,
            admin_module_1.AdminModule,
            agencies_module_1.AgenciesModule,
            files_module_1.FilesModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
        ],
    }),
    __param(0, (0, common_1.Inject)(configuration_1.appConfig.KEY)),
    __param(1, (0, common_1.Inject)(configuration_1.integrationsConfig.KEY)),
    __metadata("design:paramtypes", [Object, Object])
], AppModule);
//# sourceMappingURL=app.module.js.map