import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { ApiError } from "./lib/api/client";
import { routeTree } from "./routeTree.gen";

/**
 * Query defaults, chosen for a database that is not on this machine.
 *
 * PostgreSQL is hosted, so a request costs 1–3 seconds of round trip, and the
 * API rate-limits to 120 requests a minute. React Query's own defaults —
 * `staleTime: 0`, refetch on every mount and every window focus, three
 * retries — were written for a fast local API and are actively harmful here:
 * shared hooks like `useTutorRecord` are called from both the page and the
 * shell, so a single navigation refetched the same rows several times, and a
 * run of screens could spend the minute's budget and start failing. That is
 * what made the verification screen show "we couldn't load your verification
 * status" at random while the endpoint behind it was perfectly healthy.
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that moving between screens reuses what was just
        // fetched, short enough that returning to a screen shows fresh data.
        staleTime: 30_000,
        // Tabbing back to the browser should not re-request every visible
        // query at 2 seconds each.
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // A 4xx is an answer, not a blip: unauthenticated, forbidden, not
          // found and rate-limited all stay wrong when asked again, and
          // retrying a 429 is what deepens the hole.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Route preloads reuse anything fetched in the last 30s rather than
    // issuing a second copy of a request the page is about to make anyway.
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
