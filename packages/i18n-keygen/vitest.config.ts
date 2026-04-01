import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/i18n-keygen/src/**/*.spec.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'packages/i18n-keygen/coverage',
      reporter: ['text', 'json', 'json-summary'],
      include: ['packages/i18n-keygen/src/**/*.ts'],
      exclude: [
        'packages/i18n-keygen/src/**/*.spec.ts',
        'packages/i18n-keygen/src/core/testing/**',
      ],
    },
  },
});
