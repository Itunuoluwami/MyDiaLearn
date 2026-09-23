/**
 * The branded HTML wrapper every DiaLearn email is rendered into.
 *
 * Content comes from `notification_templates` in the database — this only
 * supplies the frame. Keeping them separate means an admin can reword a
 * notification without a deploy, and a designer can restyle every email
 * without touching copy.
 *
 * Written as table-based HTML with inline styles on purpose. It is not 2004
 * nostalgia: Outlook still renders with Word's engine, and Gmail strips
 * `<style>` blocks, so anything else degrades to unstyled text for a large
 * share of recipients.
 */

export interface LayoutInput {
  /** Preheader: the grey text clients show after the subject. */
  preview?: string;
  heading: string;
  /** Body paragraphs. Already escaped by the caller. */
  bodyHtml: string;
  action?: { label: string; url: string };
  footerNote?: string;
}

const NAVY = '#1e4258';
const ORANGE = '#e08a3c';
const INK = '#1f2937';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';

export function renderLayout(
  input: LayoutInput,
  brand: { name: string; appUrl: string },
): string {
  const preview = input.preview
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preview)}</div>`
    : '';

  const action = input.action
    ? `<tr><td style="padding:8px 32px 28px">
         <a href="${escapeAttribute(input.action.url)}"
            style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;
                   padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px">
           ${escapeHtml(input.action.label)}
         </a>
       </td></tr>`
    : '';

  const footerNote = input.footerNote
    ? `<p style="margin:0 0 8px">${escapeHtml(input.footerNote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
${preview}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden">
      <tr><td style="padding:28px 32px 8px">
        <span style="font-size:20px;font-weight:700;color:${NAVY};letter-spacing:-0.2px">${escapeHtml(brand.name)}</span>
      </td></tr>
      <tr><td style="padding:8px 32px 0">
        <h1 style="margin:0 0 12px;font-size:20px;line-height:1.35;color:${INK};font-weight:600">${escapeHtml(input.heading)}</h1>
      </td></tr>
      <tr><td style="padding:0 32px;font-size:15px;line-height:1.6;color:${INK}">${input.bodyHtml}</td></tr>
      ${action}
      <tr><td style="padding:20px 32px 28px;border-top:1px solid ${BORDER};font-size:13px;line-height:1.55;color:${MUTED}">
        ${footerNote}
        <p style="margin:0">
          <a href="${escapeAttribute(brand.appUrl)}" style="color:${MUTED}">${escapeHtml(brand.name)}</a>
          &middot; Learn. Grow. Go Global.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/**
 * Escapes template variables before they reach HTML.
 *
 * Variables carry user-supplied values — a tutor's headline, a learner's name —
 * so an unescaped one is an injection into every recipient's inbox.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

/** Plain-text alternative. Every message carries both. */
export function toPlainText(input: LayoutInput, brand: { name: string }): string {
  const body = input.bodyHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const action = input.action ? `\n\n${input.action.label}: ${input.action.url}` : '';
  const footer = input.footerNote ? `\n\n${input.footerNote}` : '';
  return `${input.heading}\n\n${body}${action}${footer}\n\n— ${brand.name}`;
}
