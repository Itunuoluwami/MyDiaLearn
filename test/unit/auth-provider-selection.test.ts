import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * There is one authentication provider.
 *
 * This file used to assert that the app could switch between Supabase and the
 * NestJS API. That switch is gone — Supabase has been removed — so what is
 * worth pinning now is the opposite: that there is exactly one provider, and
 * that a missing API URL fails loudly at startup instead of surfacing later as
 * an unexplained 401.
 */
describe("auth client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("always resolves to the NestJS provider", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test/api");
    vi.resetModules();
    const { authClient, authProvider } = await import("@/lib/auth");
    expect(authClient.provider).toBe("nestjs");
    expect(authProvider).toBe("nestjs");
  });

  it("refuses to start without an API base URL", async () => {
    // Silence here would mean every request failing with a confusing 401
    // rather than a message naming the missing variable.
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.resetModules();
    await expect(import("@/lib/auth")).rejects.toThrow(/VITE_API_BASE_URL/);
  });

  it("exposes no Supabase provider", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://api.test/api");
    vi.resetModules();
    const mod = await import("@/lib/auth");
    expect(JSON.stringify(Object.keys(mod))).not.toContain("supabase");
  });
});
