/**
 * Teaches JSON.stringify how to serialise BigInt.
 *
 * PostgreSQL's bigint arrives as a JavaScript BigInt, and count(*) is bigint —
 * so every facet, summary and paginated total hits this. Without it the
 * response serialiser throws *after* the handler has succeeded, producing a
 * 500 for a query that worked, with "Do not know how to serialize a BigInt"
 * buried in the logs.
 *
 * Counts are emitted as numbers, which is what a client expects and what the
 * existing Supabase responses already produced. A value beyond Number's safe
 * integer range becomes a string instead: silently losing precision on a
 * 9-quadrillion row count is worse than a type change nobody will ever see.
 *
 * Money is never affected. NUMERIC arrives as a string and is kept as one all
 * the way out — see the comment in payments.dto.ts.
 */
export function installBigIntSerializer(): void {
  const proto = BigInt.prototype as unknown as { toJSON?: () => number | string };
  if (proto.toJSON) return;

  proto.toJSON = function toJSON(this: bigint): number | string {
    return this >= BigInt(Number.MIN_SAFE_INTEGER) && this <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(this)
      : this.toString();
  };
}
