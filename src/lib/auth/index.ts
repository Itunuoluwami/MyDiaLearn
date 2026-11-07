import { isApiConfigured } from "@/lib/api/client";

import { nestAuthClient } from "./nestjs-adapter";
import type { AuthClient } from "./types";

export type { AuthClient, AuthChangeEvent, AuthError, AuthResult } from "./types";

/**
 * The application's authentication client.
 *
 * There is one provider. The Supabase adapter and the VITE_AUTH_PROVIDER
 * switch that chose between them are gone — the migration is finished, and a
 * switch with one position is just a way to fail later.
 *
 * Every screen imports this rather than calling an HTTP client directly, so
 * the shape the UI depends on stays in one place.
 */
if (!isApiConfigured()) {
  // Loud at startup rather than as a confusing 401 on the first request.
  throw new Error(
    "VITE_API_BASE_URL must be set to the DiaLearn API origin, " +
      "for example http://localhost:3000/api.",
  );
}

export const authClient: AuthClient = nestAuthClient;

/** Exposed for diagnostics and tests. */
export const authProvider = authClient.provider;
