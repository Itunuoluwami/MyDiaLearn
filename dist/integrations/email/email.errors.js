"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyEmailError = classifyEmailError;
function classifyEmailError(error) {
    const err = (error ?? {});
    const code = err.code ?? '';
    const status = err.responseCode;
    if (code === 'EAUTH' || status === 535 || status === 534) {
        return {
            kind: 'authentication',
            retryable: false,
            summary: 'SMTP authentication was rejected.',
        };
    }
    if (code === 'ETIMEDOUT' || code === 'ESOCKET' || code === 'ECONNECTION') {
        return {
            kind: code === 'ETIMEDOUT' ? 'timeout' : 'connection',
            retryable: true,
            summary: 'Could not reach the mail server.',
        };
    }
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'EHOSTUNREACH') {
        return {
            kind: 'connection',
            retryable: true,
            summary: 'The mail server refused the connection or could not be resolved.',
        };
    }
    if (code === 'EENVELOPE' || status === 550 || status === 553) {
        return {
            kind: 'recipient',
            retryable: false,
            summary: 'The recipient address was rejected.',
        };
    }
    if (typeof status === 'number') {
        const retryable = status >= 400 && status < 500;
        return {
            kind: 'provider',
            retryable,
            summary: `The mail server returned ${status}.`,
        };
    }
    return { kind: 'unknown', retryable: true, summary: 'Delivery failed.' };
}
//# sourceMappingURL=email.errors.js.map