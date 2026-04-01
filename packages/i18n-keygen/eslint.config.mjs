import { createPackageConfig } from '../../eslint.base.config.mjs';

export default [
  ...createPackageConfig(),
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
