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
 * Adding a key here without a corresponding flow would be inventing a
 * workflow. Don't.
 */
export const EMAIL_TRIGGERS = [
  'account.otp_verification',
  'account.welcome',
  'account.email_verification',
  'account.password_reset',
  'booking.confirmed',
  'booking.reminder',
  'payment.succeeded',
  'payout.sent',
  'tutor.verification_updated',
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
