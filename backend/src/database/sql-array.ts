/**
 * Binding JavaScript arrays through Prisma's `$queryRaw`.
 *
 * Prisma binds a JS array as a **PostgreSQL array literal** (`{a,b}`). That is
 * correct for a real array column or function argument:
 *
 *     tx.$queryRaw`select f(${ids}::uuid[])`            // works
 *
 * It is wrong for a **jsonb** column, where it fails at runtime with
 * `invalid input syntax for type json`. jsonb needs a JSON string:
 *
 *     tx.$queryRaw`... = coalesce(${toJsonb(values)}::jsonb, col)`
 *
 * The distinction is easy to get backwards because several DiaLearn columns
 * read like arrays but are jsonb — `tutors.qualifications`, `tutors.languages`
 * and `tutors.education` among them. Check the column type before choosing.
 */

/** JSON string for a jsonb column, or null when the value is not supplied. */
export function toJsonb(values: readonly unknown[] | null | undefined): string | null {
  return values === null || values === undefined ? null : JSON.stringify(values);
}
