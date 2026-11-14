"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installBigIntSerializer = installBigIntSerializer;
function installBigIntSerializer() {
    const proto = BigInt.prototype;
    if (proto.toJSON)
        return;
    proto.toJSON = function toJSON() {
        return this >= BigInt(Number.MIN_SAFE_INTEGER) && this <= BigInt(Number.MAX_SAFE_INTEGER)
            ? Number(this)
            : this.toString();
    };
}
//# sourceMappingURL=bigint-serializer.js.map