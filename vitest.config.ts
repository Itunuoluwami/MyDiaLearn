/**
 * Test config is deliberately separate from vite.config.ts.
 *
 * vite.config.ts is `@lovable.dev/vite-tanstack-config`, an opinionated wrapper
 * that injects the TanStack Start, Tailwind, nitro and env plugins and warns
 * that adding them manually breaks the build. Unit tests need none of that —
 * only the `@` alias and a DOM — so they get their own entry point and leave
 * the application build untouched.
 */
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/lib/**", "src/hooks/**"],
      exclude: ["src/integrations/supabase/types.ts"],
    },
  },
});
