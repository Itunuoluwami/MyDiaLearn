// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Hosts the dev server will answer for, beyond localhost.
 *
 * Vite refuses requests carrying an unrecognised Host header — a DNS-rebinding
 * protection, not an inconvenience. A tunnel (ngrok, Cloudflare) arrives with
 * its own hostname and is refused until listed here.
 *
 * Read from the environment rather than hardcoded, because a free tunnel gets a
 * new hostname every restart:
 *
 *   ALLOWED_DEV_HOSTS=abc123.ngrok-free.app bun run dev
 *
 * Dev server only. It has no effect on a production build.
 */
function readAllowedHosts(): string[] {
  // Prefer the environment, so a one-off tunnel can be allowed inline:
  //   ALLOWED_DEV_HOSTS=abc123.ngrok-free.app bun run dev
  let raw = process.env.ALLOWED_DEV_HOSTS ?? "";

  // Otherwise fall back to .env, so the value survives however the dev server
  // is started — a launcher that does not pass custom environment variables
  // would otherwise silently drop it and the tunnel would 403.
  if (!raw) {
    try {
      const envFile = readFileSync(new URL(".env", import.meta.url), "utf8");
      raw = /^ALLOWED_DEV_HOSTS=(.*)$/m.exec(envFile)?.[1] ?? "";
    } catch {
      // No .env is the normal case in CI.
    }
  }

  return raw
    .split(",")
    .map((host) => host.trim().replace(/^https?:\/\//, ""))
    .filter(Boolean);
}

const allowedHosts = readAllowedHosts();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      ...(allowedHosts.length ? { allowedHosts } : {}),
    },
  },
});
