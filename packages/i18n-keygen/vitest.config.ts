import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/i18n-keygen/src/**/*.spec.ts'],
    restoreMocks: true,
    coverage: {
      reportsDirectory: 'packages/i18n-keygen/coverage',
    },
  },
});
