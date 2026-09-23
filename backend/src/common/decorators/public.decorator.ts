import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opts a route out of JwtAuthGuard.
 *
 * The guard is bound globally, so the API denies by default and every
 * unauthenticated endpoint has to say so explicitly. Forgetting the decorator
 * makes a route unreachable, which is a loud failure; forgetting to add a guard
 * in the opposite arrangement silently exposes it.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
