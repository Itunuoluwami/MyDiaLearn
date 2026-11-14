"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
const bootstrap_1 = require("./bootstrap");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true, rawBody: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const config = (0, bootstrap_1.configureApp)(app);
    const logger = app.get(nestjs_pino_1.Logger);
    if (typeof config.port === 'string') {
        app.getHttpAdapter().getInstance().set('trust proxy', 1);
        await app.listen(config.port);
    }
    else {
        await app.listen(config.port, '0.0.0.0');
    }
    logger.log(`DiaLearn API listening on port ${config.port} ` +
        `(env=${config.env}, prefix=/${config.apiPrefix})`);
}
void bootstrap();
//# sourceMappingURL=main.js.map