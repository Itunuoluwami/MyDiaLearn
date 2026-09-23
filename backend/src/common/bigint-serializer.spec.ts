import { installBigIntSerializer } from './bigint-serializer';

describe('installBigIntSerializer', () => {
  beforeAll(() => installBigIntSerializer());

  it('lets JSON.stringify handle a bigint at all', () => {
    // Without this, count(*) results throw after the handler has already
    // succeeded — a 500 for a query that worked.
    expect(() => JSON.stringify({ total: BigInt(13) })).not.toThrow();
  });

  it('emits counts as numbers, matching what clients already received', () => {
    expect(JSON.stringify({ total: BigInt(13) })).toBe('{"total":13}');
    expect(JSON.stringify({ total: BigInt(0) })).toBe('{"total":0}');
  });

  it('falls back to a string rather than losing precision', () => {
    const huge = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(10);
    expect(JSON.stringify({ n: huge })).toBe(`{"n":"${huge.toString()}"}`);
  });

  it('is idempotent, so a second install does not wrap the first', () => {
    installBigIntSerializer();
    installBigIntSerializer();
    expect(JSON.stringify({ total: BigInt(7) })).toBe('{"total":7}');
  });
});
