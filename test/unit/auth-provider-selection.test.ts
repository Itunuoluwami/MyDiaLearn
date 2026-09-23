import { describe, expect, it, vi, afterEach } from "vitest";

/**
 * Provider selection lives in its own file because it must run against the
 * REAL api client. The adapter tests mock that module wholesale, including
 * isApiConfigured, which would mask exactly the misconfiguration this checks.
 */

describe("provider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to supabase", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER", "");
    vi.resetModules();
    const { authClient } = await import("@/lib/auth");
    expect(authClient.provider).toBe("supabase");
  });

  it("selects nestjs when configured with an API base URL", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER", "nestjs");
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test/api");
    vi.resetModules();
    const { authClient } = await import("@/lib/auth");
    expect(authClient.provider).toBe("nestjs");
  });

  it("refuses nestjs without an API base URL rather than falling back", async () => {
    // Falling back silently would be worse than failing: the app would run on
    // Supabase while someone believed they were testing the new stack.
    vi.stubEnv("VITE_AUTH_PROVIDER", "nestjs");
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.resetModules();
    await expect(import("@/lib/auth")).rejects.toThrow(/VITE_API_BASE_URL/);
  });

  it("rejects an unknown provider name", async () => {
    vi.stubEnv("VITE_AUTH_PROVIDER", "firebase");
    vi.resetModules();
    await expect(import("@/lib/auth")).rejects.toThrow(/must be "supabase" or "nestjs"/);
  });
});
