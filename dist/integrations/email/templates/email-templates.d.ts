import { type LayoutInput } from './email-layout';
export declare const EMAIL_TRIGGERS: readonly ["account.otp_verification", "account.welcome", "account.email_verification", "account.password_reset", "booking.created", "booking.confirmed", "booking.cancelled", "booking.reminder", "assignment.assigned", "message.received", "payment.succeeded", "payout.sent", "tutor.verification_updated", "tutor.verification_approved", "tutor.verification_rejected", "admin.invitation", "agency.tutor_invite"];
export type EmailTrigger = (typeof EMAIL_TRIGGERS)[number];
export interface TemplateDefinition {
    subject: string;
    heading: string;
    paragraphs: string[];
    action?: {
        label: string;
        urlVar: string;
    };
    footerNote?: string;
    variables: string[];
}
export declare const TEMPLATE_FALLBACKS: Record<EmailTrigger, TemplateDefinition>;
export declare function isEmailTrigger(value: string): value is EmailTrigger;
export declare function renderVariables(template: string, vars: Record<string, unknown>): {
    rendered: string;
    missing: string[];
};
export declare function buildLayoutInput(definition: TemplateDefinition, vars: Record<string, unknown>): {
    layout: LayoutInput;
    subject: string;
    missing: string[];
};
