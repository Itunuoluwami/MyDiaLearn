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
var GovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit/audit.service");
const configuration_1 = require("../../config/configuration");
const email_service_1 = require("../../integrations/email/email.service");
const payment_processing_service_1 = require("../../payments/services/payment-processing.service");
const admin_errors_1 = require("../admin-errors");
const governance_repository_1 = require("./governance.repository");
const ROLE_LABEL = { admin: 'an admin', super_admin: 'a super admin' };
let GovernanceService = GovernanceService_1 = class GovernanceService {
    repository;
    email;
    audit;
    payments;
    config;
    logger = new common_1.Logger(GovernanceService_1.name);
    constructor(repository, email, audit, payments, config) {
        this.repository = repository;
        this.email = email;
        this.audit = audit;
        this.payments = payments;
        this.config = config;
    }
    async adminAccounts(adminId) {
        return this.repository.adminAccounts(adminId);
    }
    async invitations(adminId) {
        return this.repository.invitations(adminId);
    }
    async invite(adminId, input, context) {
        const email = input.email.trim().toLowerCase();
        let created;
        try {
            created = await this.repository.createInvitation(adminId, {
                email,
                role: input.role,
                permissionKeys: input.permissionKeys,
            });
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not create that invitation.');
        }
        const expiresAt = new Date(created.expires_at);
        const acceptUrl = `${this.config.appUrl}/auth/accept-invite?email=${encodeURIComponent(email)}`;
        const sent = await this.email.sendTemplate({
            trigger: 'admin.invitation',
            to: email,
            vars: {
                role: ROLE_LABEL[input.role] ?? input.role,
                otp: created.otp,
                expires_at: expiresAt.toUTCString(),
                accept_url: acceptUrl,
            },
        });
        const emailed = sent !== null && this.email.providerName !== 'log';
        if (!emailed) {
            this.logger.warn('Admin invitation email was not sent; returning the code to the inviter.');
        }
        await this.audit.record('admin.invite_created', {
            actorId: adminId,
            entityType: 'admin_invitation',
            entityId: created.invitation_id,
            context,
            metadata: { role: input.role, permissions: input.permissionKeys.length, emailed },
        });
        return {
            invitationId: created.invitation_id,
            emailed,
            expiresAt: expiresAt.toISOString(),
            ...(emailed ? {} : { otp: created.otp }),
        };
    }
    async revokeInvitation(adminId, invitationId, context) {
        await this.call(() => this.repository.revokeInvitation(adminId, invitationId));
        await this.audit.record('admin.invite_revoked', {
            actorId: adminId,
            entityType: 'admin_invitation',
            entityId: invitationId,
            context,
        });
    }
    async redeemInvitation(userId, email, otp) {
        await this.call(() => this.repository.redeemInvitation(userId, email.trim().toLowerCase(), otp.trim()));
    }
    async permissionCatalog(adminId) {
        return this.repository.permissionCatalog(adminId);
    }
    async userPermissions(adminId, userId) {
        return this.repository.userPermissions(adminId, userId);
    }
    async setUserPermission(adminId, userId, key, granted, context) {
        await this.call(() => this.repository.setUserPermission(adminId, userId, key, granted));
        await this.audit.record('user.permission_changed', {
            actorId: adminId,
            entityType: 'profile',
            entityId: userId,
            context,
            metadata: { permissionKey: key, granted },
        });
    }
    async requestAction(adminId, action, payload) {
        const requestId = await this.call(() => this.repository.requestAction(adminId, action, payload));
        return { requestId };
    }
    async actionRequests(adminId, status) {
        return this.repository.actionRequests(adminId, status);
    }
    async reviewAction(adminId, requestId, input, context) {
        const result = await this.call(() => this.repository.reviewAction(adminId, requestId, input.approve, input.notes?.trim() || null));
        if (result['status'] === 'executed' && result['action'] === 'payout.settle') {
            const payload = result['payload'];
            const payoutId = payload && typeof payload === 'object'
                ? payload['payout_id']
                : undefined;
            if (typeof payoutId === 'string') {
                await this.payments.notifyPayoutSent(payoutId);
            }
        }
        if (result['status'] === 'executed' &&
            (result['action'] === 'payment.refund' ||
                result['action'] === 'booking.cancel_with_refund')) {
            try {
                await this.payments.processPendingRefunds();
            }
            catch (error) {
                this.logger.error({ requestId, error: error instanceof Error ? error.message : String(error) }, 'Refund processing after approval failed; it stays pending for retry');
            }
        }
        await this.audit.record('admin.action_reviewed', {
            actorId: adminId,
            entityType: 'admin_action_request',
            entityId: requestId,
            context,
            metadata: { approve: input.approve, status: result['status'] ?? null },
        });
        return result;
    }
    async auditLogs(adminId, query) {
        return this.repository.auditLogs(adminId, {
            action: query.action?.trim() || null,
            entityType: query.entityType?.trim() || null,
            actorEmail: query.actorEmail?.trim() || null,
            from: query.from ? new Date(query.from) : null,
            to: query.to ? new Date(query.to) : null,
        });
    }
    async call(operation) {
        try {
            return await operation();
        }
        catch (error) {
            throw (0, admin_errors_1.translateAdminError)(error, 'We could not complete that just now.');
        }
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = GovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)(configuration_1.authConfig.KEY)),
    __metadata("design:paramtypes", [governance_repository_1.GovernanceRepository,
        email_service_1.EmailService,
        audit_service_1.AuditService,
        payment_processing_service_1.PaymentProcessingService, Object])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map