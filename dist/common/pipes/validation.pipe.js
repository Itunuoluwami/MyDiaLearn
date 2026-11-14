"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationPipe = createValidationPipe;
const common_1 = require("@nestjs/common");
function createValidationPipe() {
    return new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: false },
        exceptionFactory: (errors) => new common_1.BadRequestException({ message: flatten(errors) }),
    });
}
function flatten(errors, parent = '') {
    return errors.flatMap((error) => {
        const path = parent ? `${parent}.${error.property}` : error.property;
        const own = Object.values(error.constraints ?? {}).map((m) => `${path}: ${m}`);
        const nested = error.children?.length ? flatten(error.children, path) : [];
        return [...own, ...nested];
    });
}
//# sourceMappingURL=validation.pipe.js.map