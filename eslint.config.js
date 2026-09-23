import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Generated files. `types.ts` is emitted by `supabase gen types` and
    // marked do-not-edit; linting it produced 2,074 of the repo's 3,306
    // problems and every fix would be discarded on the next regeneration.
    ignores: [
      "dist",
      ".output",
      ".vinxi",
      ".wrangler",
      // Separate application with its own eslint.config.mjs and Prettier
      // settings (single quotes, width 95). Linting it from here reports
      // style conflicts against the frontend's rules, and `format` would
      // rewrite it incorrectly.
      "backend",
      "**/routeTree.gen.ts",
      "src/integrations/supabase/types.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // previewAuthStorage.ts declares a timeout handle that its own
      // finish() closure reads before the assignment below it. Rewriting
      // that to satisfy the rule would mean restructuring working auth
      // storage code for a style preference.
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
    },
  },
  eslintPluginPrettier,
);
