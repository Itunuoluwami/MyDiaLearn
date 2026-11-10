/// <reference types="vite/client" />

/**
 * Declaring the environment is not cosmetic.
 *
 * Vite replaces `import.meta.env.VITE_FOO` statically at build time. It cannot
 * do that for `import.meta.env["VITE_FOO"]`, so it falls back to emitting the
 * *whole* env object into the bundle — which shipped every `VITE_*` value,
 * including the dead `VITE_SUPABASE_*` entries, to the browser.
 *
 * `noPropertyAccessFromIndexSignature` is on, so dot access only typechecks
 * against named members. Declaring them here is what makes the safe form the
 * writable one. Add new `VITE_*` variables to this interface, read them with
 * dot access, and never put a secret behind a `VITE_` prefix.
 */
interface ImportMetaEnv {
  /** Origin of the NestJS API. Required; the app refuses to start without it. */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
