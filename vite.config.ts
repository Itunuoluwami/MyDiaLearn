// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
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
const allowedHosts = (process.env.ALLOWED_DEV_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

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
