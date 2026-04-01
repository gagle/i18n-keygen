import nx from '@nx/eslint-plugin';

export const sharedConfig = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
];

export function createPackageConfig() {
  return [...sharedConfig];
}

export function createAppConfig() {
  return [...sharedConfig];
}

export function createE2eConfig() {
  return [...sharedConfig];
}
