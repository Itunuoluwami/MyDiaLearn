import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'src/**/*.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: { sourceType: 'module' },
    },
    rules: {
      // NestJS leans on decorator metadata and constructor injection, which
      // the base config reads as unused parameters and explicit-any noise.
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        // Adapter methods must match their interface even where an argument is
        // unused, hence the leading-underscore convention.
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
