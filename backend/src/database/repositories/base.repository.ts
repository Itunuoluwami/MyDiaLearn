import { PrismaService } from '../prisma.service';

/**
 * Common base for repositories.
 *
 * Repositories are the ONLY place Prisma is touched. Two reasons, both
 * specific to this migration:
 *
 * 1. The database this backend talks to enforces tenancy with row-level
 *    security today. A Prisma client connects as one privileged role, so those
 *    predicates do not apply. Every repository method must therefore scope its
 *    own query — `where: { userId }` and friends — reproducing the policy it
 *    replaces. Keeping queries in one layer makes that auditable; scattering
 *    them through services makes it impossible.
 *
 * 2. Several domains will keep calling the existing PL/pgSQL functions for a
 *    while rather than reimplementing them in TypeScript. A repository can
 *    switch from `$queryRaw` against a function to a native Prisma query
 *    without its callers noticing, which is what makes each domain
 *    independently revertible.
 */
export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}
}
