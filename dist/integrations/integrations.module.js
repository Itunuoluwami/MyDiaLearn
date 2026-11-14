"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_module_1 = require("./email/email.module");
const classroom_interface_1 = require("./classroom/classroom.interface");
const none_classroom_provider_1 = require("./classroom/none-classroom.provider");
const payment_module_1 = require("./payments/payment.module");
const local_disk_storage_provider_1 = require("./storage/local-disk-storage.provider");
const storage_interface_1 = require("./storage/storage.interface");
const unconfigured_storage_provider_1 = require("./storage/unconfigured-storage.provider");
const storageProvider = {
    provide: storage_interface_1.STORAGE_PROVIDER,
    inject: [config_1.ConfigService],
    useFactory: (config) => config.getOrThrow('integrations').storage === 'local'
        ? new local_disk_storage_provider_1.LocalDiskStorageProvider(config)
        : new unconfigured_storage_provider_1.UnconfiguredStorageProvider(),
};
const classroomProvider = {
    provide: classroom_interface_1.CLASSROOM_PROVIDER,
    useClass: none_classroom_provider_1.NoneClassroomProvider,
};
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule, payment_module_1.PaymentModule],
        providers: [storageProvider, classroomProvider],
        exports: [email_module_1.EmailModule, payment_module_1.PaymentModule, storage_interface_1.STORAGE_PROVIDER, classroom_interface_1.CLASSROOM_PROVIDER],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map