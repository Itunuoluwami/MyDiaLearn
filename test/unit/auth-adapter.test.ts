import { describe, expect, it, vi, afterEach } from "vitest";

import { ApiError } from "@/lib/api/client";

/**
 * apiRequest is mocked at the module boundary. Spying on the imported binding
 * does not work under ESM — the adapter holds a live binding to the original,
 * so a later spy is never seen.
 */
const apiRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiRequest: apiRequestMock, isApiConfigured: () => true };
});

/**
 * The adapter's job is to make a provider swap invisible to the UI.
 *
 * The existing auth screens branch on substrings of `error.message` — that is
 * how they read Supabase errors, and rewriting them was explicitly out of
 * scope. So the NestJS adapter has to speak the same vocabulary. These tests
 * pin that contract: if someone "tidies up" a message, the form that depends on
 * it fails here rather than silently degrading to a generic error in front of a
 * user.
 */

describe("NestJS auth adapter error mapping", () => {
  afterEach(() => {
    apiRequestMock.mockReset();
  });

  /** Drives the adapter with a failing API call and returns the mapped error. */
  async function signInExpectingError(error: ApiError) {
    apiRequestMock.mockRejectedValue(error);
    const { nestAuthClient } = await import("@/lib/auth/nestjs-adapter");
    const result = await nestAuthClient.signInWithPassword({
      email: "a@b.com",
      password: "x",
    });
    return result.error;
  }

  it("maps 401 to a message SignInForm recognises as bad credentials", async () => {
    const error = await signInExpectingError(
      new ApiError(401, "UNAUTHENTICATED", "That email and password combination doesn't match."),
    );
    // SignInForm: raw.includes("invalid login")
    expect(error?.message.toLowerCase()).toContain("invalid login");
  });

  it("maps an unverified address to a message SignInForm recognises", async () => {
    const error = await signInExpectingError(
      new ApiError(403, "NOT_AUTHORIZED", "Please verify your email address.", {
        reason: "email_not_verified",
      }),
    );
    // SignInForm: raw.includes("confirm")
    expect(error?.message.toLowerCase()).toContain("confirm");
  });

  it("maps 409 to a message SignUpForm recognises as a duplicate", async () => {
    const error = await signInExpectingError(
      new ApiError(409, "CONFLICT", "An account with this email already exists."),
    );
    // SignUpForm: raw.includes("already registered")
    expect(error?.message.toLowerCase()).toContain("already registered");
  });

  it("maps 429 to a message ForgotPasswordForm recognises as rate limiting", async () => {
    const error = await signInExpectingError(
      new ApiError(429, "RATE_LIMITED", "Too many requests."),
    );
    // ForgotPasswordForm: raw.includes("rate limit") || raw.includes("too many")
    expect(error?.message.toLowerCase()).toMatch(/rate limit|too many/);
  });

  it("maps a transport failure to a message every form recognises", async () => {
    const error = await signInExpectingError(
      new ApiError(0, "NETWORK_ERROR", "network request failed"),
    );
    // Every form: raw.includes("network") || raw.includes("fetch")
    expect(error?.message.toLowerCase()).toMatch(/network|fetch/);
  });

  it("maps an expired reset token to a message ResetPasswordForm recognises", async () => {
    const error = await signInExpectingError(
      new ApiError(400, "VALIDATION_FAILED", "This reset link has expired."),
    );
    // ResetPasswordForm: includes("session") || includes("token") || includes("expired")
    expect(error?.message.toLowerCase()).toMatch(/session|token|expired/);
  });
});
