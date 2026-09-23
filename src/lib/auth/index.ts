import { isApiConfigured } from "@/lib/api/client";

import { nestAuthClient } from "./nestjs-adapter";
import { supabaseAuthClient } from "./supabase-adapter";
import type { AuthClient } from "./types";

export type { AuthClient, AuthChangeEvent, AuthError, AuthResult } from "./types";

/**
 * Which authentication provider the app uses.
 *
 * Set `VITE_AUTH_PROVIDER=nestjs` to switch. The default is `supabase`, and
 * that is deliberate: migration rule 7 says working authentication is not
 * removed until its replacement has been verified, and the default is what
 * every environment gets until someone decides otherwise.
 *
 * Switching is a build-time decision because Vite inlines VITE_* at build time.
 * That is a feature here — an environment cannot drift between the two halfway
 * through a session.
 */
function selectProvider(): AuthClient {
  // `||` not `??`: an env file containing a bare `VITE_AUTH_PROVIDER=` yields
  // an empty string, which is a request for the default, not a provider name.
  const configured = (import.meta.env["VITE_AUTH_PROVIDER"] || "supabase").toLowerCase();

  if (configured === "nestjs") {
    if (!isApiConfigured()) {
      // Falling back silently would be worse: the app would appear to work on
      // Supabase while someone believed they were testing the new stack.
      throw new Error(
        "VITE_AUTH_PROVIDER=nestjs requires VITE_API_BASE_URL to be set to the " +
          "NestJS API origin (for example http://localhost:3000).",
      );
    }
    return nestAuthClient;
  }

  if (configured !== "supabase") {
    throw new Error(`VITE_AUTH_PROVIDER must be "supabase" or "nestjs", received "${configured}".`);
  }

  return supabaseAuthClient;
}

/**
 * The application's authentication client.
 *
 * Every screen imports this instead of `supabase.auth`. The call signatures are
 * identical, so switching provider changes no UI code at all.
 */
export const authClient: AuthClient = selectProvider();

/** Exposed for diagnostics and tests. */
export const authProvider = authClient.provider;
