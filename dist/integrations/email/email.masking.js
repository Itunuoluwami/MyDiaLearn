"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskAddress = maskAddress;
function maskAddress(address) {
    const at = address.lastIndexOf('@');
    if (at <= 0)
        return '***';
    const local = address.slice(0, at);
    const domain = address.slice(at);
    return `${local[0]}***${domain}`;
}
//# sourceMappingURL=email.masking.js.map