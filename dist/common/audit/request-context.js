"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditContextOf = auditContextOf;
function auditContextOf(request) {
    const forwarded = request.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || request.ip;
    return {
        ...(ip ? { ip } : {}),
        ...(request.headers['user-agent'] ? { userAgent: request.headers['user-agent'] } : {}),
        ...(request.requestId
            ? { requestId: request.requestId }
            : {}),
    };
}
//# sourceMappingURL=request-context.js.map