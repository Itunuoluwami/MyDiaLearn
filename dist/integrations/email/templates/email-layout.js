"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLayout = renderLayout;
exports.escapeHtml = escapeHtml;
exports.escapeAttribute = escapeAttribute;
exports.toPlainText = toPlainText;
const NAVY = '#1e4258';
const ORANGE = '#e08a3c';
const INK = '#1f2937';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
function renderLayout(input, brand) {
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
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}
function toPlainText(input, brand) {
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
//# sourceMappingURL=email-layout.js.map