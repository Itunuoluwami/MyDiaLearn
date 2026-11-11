import { escapeHtml, type LayoutInput } from './email-layout';

/**
 * The email trigger keys DiaLearn actually uses.
 *
 * Every one of these corresponds to an **active row in
 * `notification_templates`** or to a flow that already exists in the
 * application. Nothing here is invented:
 *
 *   account.otp_verification  seeded, email  — verification code
 *   account.welcome           seeded, email  — after signup
 *   booking.confirmed         seeded, email  — tutor accepted and paid
 *   booking.reminder          seeded, email  — lesson starting soon
 *   payment.succeeded         seeded, email  — charge recorded
 *   payout.sent               seeded, email  — payout settled
 *
 * Two more come from flows in the auth module rather than the templates table,
 * because GoTrue used to own them and there was never a row to seed:
 *
 *   account.password_reset    reset link
 *   account.email_verification  confirmation link
 *
 * And one from the admin invitation flow, which GoTrue's invite mail used to
 * carry (the code was rendered from user metadata, never a templates row):
 *
 *   admin.invitation          one-time code and accept link
 *   agency.tutor_invite       an agency added you; set your password
 *
 * Adding a key here without a corresponding flow would be inventing a
 * workflow. Don't.
 */
export const EMAIL_TRIGGERS = [
  'account.otp_verification',
  'account.welcome',
  'account.email_verification',
  'account.password_reset',
  'booking.created',
  'booking.confirmed',
  'booking.cancelled',
  'booking.reminder',
  'assignment.assigned',
  'message.received',
  'payment.succeeded',
  'payout.sent',
  'tutor.verification_updated',
  'tutor.verification_approved',
  'tutor.verification_rejected',
  'admin.invitation',
  'agency.tutor_invite',
] as const;

export type EmailTrigger = (typeof EMAIL_TRIGGERS)[number];

export interface TemplateDefinition {
  /** Used only when `notification_templates` has no active row for the key. */
  subject: string;
  heading: string;
  /** Paragraphs. Variables as `{{name}}`; substituted and escaped later. */
  paragraphs: string[];
  action?: { label: string; urlVar: string };
  footerNote?: string;
  /** Documents what the caller must supply. Missing ones are reported. */
  variables: string[];
}

/**
 * Fallback definitions.
 *
 * The database is the source of truth for subject and body — an admin editing
 * a template must take effect without a deploy. These exist for two cases: a
 * key whose row was never seeded (the two auth links), and a deployment whose
 * templates table has not been populated yet. Using one is logged, because it
 * means the database and the code disagree.
 */
export const TEMPLATE_FALLBACKS: Record<EmailTrigger, TemplateDefinition> = {
  'account.otp_verification': {
    subject: 'Verify your DiaLearn email',
    heading: 'Verify your email address',
    paragraphs: [
      'Hello {{full_name}},',
      'Your DiaLearn verification code is <strong>{{otp_code}}</strong>.',
      'It expires in {{expiry_minutes}} minutes and can be used once.',
    ],
    footerNote: "If you didn't request this, you can ignore this email.",
    variables: ['full_name', 'otp_code', 'expiry_minutes'],
  },

  'account.welcome': {
    subject: 'Welcome to DiaLearn',
    heading: 'Welcome to DiaLearn',
    paragraphs: ['Welcome {{full_name}}!', 'Your {{role}} account is ready.'],
    action: { label: 'Open DiaLearn', urlVar: 'app_url' },
    variables: ['full_name', 'role'],
  },

  'account.email_verification': {
    subject: 'Confirm your DiaLearn email address',
    heading: 'Confirm your email address',
    paragraphs: [
      'Welcome to DiaLearn. Confirm your email address to finish setting up your account.',
      'This link expires in {{expiry_hours}} hours.',
    ],
    action: { label: 'Confirm email address', urlVar: 'verification_url' },
    footerNote: "If you didn't create a DiaLearn account, you can ignore this email.",
    variables: ['verification_url', 'expiry_hours'],
  },

  'account.password_reset': {
    subject: 'Reset your DiaLearn password',
    heading: 'Reset your password',
    paragraphs: [
      'Someone asked to reset the password for this DiaLearn account.',
      'This link expires in {{expiry_minutes}} minutes and can be used once.',
    ],
    action: { label: 'Choose a new password', urlVar: 'reset_url' },
    footerNote: "If it wasn't you, nothing has changed and you can ignore this email.",
    variables: ['reset_url', 'expiry_minutes'],
  },

  'booking.confirmed': {
    subject: 'Your lesson is confirmed',
    heading: 'Your lesson is confirmed',
    paragraphs: [
      '{{tutor_name}} confirmed the {{subject}} lesson for {{student_name}}.',
      'It starts at {{starts_at}}.',
    ],
    action: { label: 'View booking', urlVar: 'booking_url' },
    variables: ['tutor_name', 'subject', 'student_name', 'starts_at'],
  },

  'booking.created': {
    subject: 'New lesson request from {{student_name}}',
    heading: 'You have a new lesson request',
    paragraphs: [
      '{{student_name}} has asked for a {{subject}} lesson on {{starts_at}}.',
      'Accept or decline it from your classes page.',
    ],
    action: { label: 'Open my classes', urlVar: 'classes_url' },
    variables: ['student_name', 'subject', 'starts_at'],
  },

  'booking.cancelled': {
    subject: 'A lesson was cancelled',
    heading: 'A lesson was cancelled',
    paragraphs: ['The {{subject}} lesson on {{starts_at}} was cancelled.', '{{refund_note}}'],
    variables: ['subject', 'starts_at', 'refund_note'],
  },

  'assignment.assigned': {
    subject: 'New assignment: {{title}}',
    heading: 'You have new homework',
    paragraphs: ['{{tutor_name}} assigned "{{title}}".', 'Due {{due_at}}.'],
    action: { label: 'Open the assignment', urlVar: 'assignment_url' },
    variables: ['title', 'tutor_name', 'due_at'],
  },

  'message.received': {
    subject: 'New message from {{sender_name}}',
    heading: 'You have a new message',
    paragraphs: ['{{sender_name}} sent you a message:', '{{preview}}'],
    action: { label: 'Reply on DiaLearn', urlVar: 'messages_url' },
    footerNote: 'Replies stay on DiaLearn so there is always a record.',
    variables: ['sender_name', 'preview'],
  },

  'tutor.verification_approved': {
    subject: "You're verified",
    heading: "You're verified",
    paragraphs: [
      'Your profile has been approved.',
      "You're now listed in tutor search and families can book you.",
    ],
    action: { label: 'Open my profile', urlVar: 'profile_url' },
    variables: [],
  },

  'tutor.verification_rejected': {
    subject: 'Your verification needs changes',
    heading: 'Your verification needs changes',
    paragraphs: [
      'Our team reviewed your profile and needs some changes before approving it.',
      'Open your verification page to see what to fix, then submit again.',
    ],
    action: { label: 'See what to fix', urlVar: 'verification_url' },
    variables: [],
  },

  'booking.reminder': {
    subject: 'Your lesson starts soon',
    heading: 'Your lesson starts soon',
    paragraphs: ['{{subject}} with {{tutor_name}} starts at {{starts_at}}.'],
    action: { label: 'Join the classroom', urlVar: 'classroom_url' },
    variables: ['subject', 'tutor_name', 'starts_at'],
  },

  'payment.succeeded': {
    subject: 'Payment received',
    heading: 'Payment received',
    paragraphs: ['We received {{amount}} {{currency}} for the {{subject}} lesson.'],
    footerNote: 'This is a receipt for your records.',
    variables: ['amount', 'currency', 'subject'],
  },

  'payout.sent': {
    subject: 'Your payout is on the way',
    heading: 'Your payout is on the way',
    paragraphs: ['A payout of {{amount}} {{currency}} has been sent.'],
    variables: ['amount', 'currency'],
  },

  'tutor.verification_updated': {
    subject: 'Your DiaLearn verification status changed',
    heading: 'Verification update',
    paragraphs: ['Your verification status is now <strong>{{status}}</strong>.'],
    action: { label: 'View your profile', urlVar: 'profile_url' },
    variables: ['status'],
  },

  'admin.invitation': {
    subject: "You've been invited to administer DiaLearn",
    heading: 'Admin invitation',
    paragraphs: [
      'You have been invited to join DiaLearn as <strong>{{role}}</strong>.',
      'Your one-time code is <strong>{{otp}}</strong>. It expires on {{expires_at}}.',
      'Sign in or create an account with this email address, then enter the code to accept.',
    ],
    action: { label: 'Accept invitation', urlVar: 'accept_url' },
    footerNote: "If you weren't expecting this, you can ignore this email.",
    variables: ['role', 'otp', 'expires_at', 'accept_url'],
  },

  'agency.tutor_invite': {
    subject: '{{agency_name}} added you as a tutor on DiaLearn',
    heading: 'Welcome to DiaLearn',
    paragraphs: [
      '<strong>{{agency_name}}</strong> has set up a DiaLearn tutor account for you.',
      'Choose a password to sign in, see your classes and teach. The link expires in {{expiry_hours}} hours.',
    ],
    action: { label: 'Set your password', urlVar: 'set_password_url' },
    footerNote: "If you don't work with this agency, you can ignore this email.",
    variables: ['agency_name', 'set_password_url', 'expiry_hours'],
  },
};

export function isEmailTrigger(value: string): value is EmailTrigger {
  return (EMAIL_TRIGGERS as readonly string[]).includes(value);
}

/**
 * Substitutes `{{name}}`, escaping every value.
 *
 * Mirrors the database's render_template(). Unknown placeholders are left
 * intact rather than blanked, so a missing variable is visible in the output
 * instead of producing a sentence with a hole in it.
 */
export function renderVariables(
  template: string,
  vars: Record<string, unknown>,
): { rendered: string; missing: string[] } {
  const missing: string[] = [];
  const rendered = template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null || value === '') {
      missing.push(key);
      return match;
    }
    return escapeHtml(String(value));
  });
  return { rendered, missing: [...new Set(missing)] };
}

/** Builds the layout input for a definition and a set of variables. */
export function buildLayoutInput(
  definition: TemplateDefinition,
  vars: Record<string, unknown>,
): { layout: LayoutInput; subject: string; missing: string[] } {
  const missing: string[] = [];

  const paragraphs = definition.paragraphs.map((p) => {
    const { rendered, missing: m } = renderVariables(p, vars);
    missing.push(...m);
    return `<p style="margin:0 0 12px">${rendered}</p>`;
  });

  const subjectResult = renderVariables(definition.subject, vars);
  missing.push(...subjectResult.missing);

  const actionUrl = definition.action ? vars[definition.action.urlVar] : undefined;
  const layout: LayoutInput = {
    preview: definition.subject,
    heading: renderVariables(definition.heading, vars).rendered,
    bodyHtml: paragraphs.join('\n'),
    ...(definition.action && typeof actionUrl === 'string' && actionUrl
      ? { action: { label: definition.action.label, url: actionUrl } }
      : {}),
    ...(definition.footerNote ? { footerNote: definition.footerNote } : {}),
  };

  return { layout, subject: subjectResult.rendered, missing: [...new Set(missing)] };
}
