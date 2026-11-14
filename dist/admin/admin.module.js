"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const payments_module_1 = require("../payments/payments.module");
const notifications_module_1 = require("../notifications/notifications.module");
const admin_controller_1 = require("./admin.controller");
const admin_repository_1 = require("./admin.repository");
const admin_service_1 = require("./admin.service");
const governance_controller_1 = require("./governance/governance.controller");
const governance_repository_1 = require("./governance/governance.repository");
const governance_service_1 = require("./governance/governance.service");
const admin_settings_controller_1 = require("./settings/admin-settings.controller");
const admin_settings_repository_1 = require("./settings/admin-settings.repository");
const admin_settings_service_1 = require("./settings/admin-settings.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, payments_module_1.PaymentsModule],
        controllers: [
            admin_controller_1.AdminController,
            admin_settings_controller_1.AdminSettingsController,
            governance_controller_1.GovernanceController,
            governance_controller_1.InvitationsController,
        ],
        providers: [
            admin_repository_1.AdminRepository,
            admin_service_1.AdminService,
            admin_settings_repository_1.AdminSettingsRepository,
            admin_settings_service_1.AdminSettingsService,
            governance_repository_1.GovernanceRepository,
            governance_service_1.GovernanceService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map