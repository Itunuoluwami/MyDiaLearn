"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const configuration_1 = require("./config/configuration");
const bigint_serializer_1 = require("./common/bigint-serializer");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
function configureApp(app) {
    (0, bigint_serializer_1.installBigIntSerializer)();
    const config = app.get(configuration_1.appConfig.KEY);
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    const origins = config.corsOrigin
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: origins.includes('*') ? true : origins,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
        exposedHeaders: ['x-request-id'],
        maxAge: 86_400,
    });
    app.setGlobalPrefix(config.apiPrefix, { exclude: ['health', 'health/{*path}'] });
    app.useGlobalPipes((0, validation_pipe_1.createValidationPipe)());
    app.enableShutdownHooks();
    return config;
}
//# sourceMappingURL=bootstrap.js.map