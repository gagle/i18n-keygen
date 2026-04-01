import * as path from 'node:path';
import { resolveScope } from './resolve-scope';

describe('resolveScope', () => {
  const workspaceRoot = '/workspace';

  it('should resolve default file pattern ({lang}.json)', () => {
    const result = resolveScope(workspaceRoot, { name: 'core', dir: 'i18n/core' }, ['en', 'es']);

    expect(result.name).toBe('core');
    expect(result.files.get('en')).toBe(path.resolve('/workspace', 'i18n/core', 'en.json'));
    expect(result.files.get('es')).toBe(path.resolve('/workspace', 'i18n/core', 'es.json'));
  });

  it('should resolve custom file pattern with {lang} placeholder', () => {
    const result = resolveScope(
      workspaceRoot,
      { name: 'cdk', dir: 'locales', filePattern: '{lang}/cdk.module.json' },
      ['en-GB', 'en'],
    );

    expect(result.files.get('en-GB')).toBe(
      path.resolve('/workspace', 'locales', 'en-GB/cdk.module.json'),
    );
    expect(result.files.get('en')).toBe(
      path.resolve('/workspace', 'locales', 'en/cdk.module.json'),
    );
  });

  it('should resolve {name} placeholder in file pattern', () => {
    const result = resolveScope(
      workspaceRoot,
      { name: 'admin', dir: 'locales', filePattern: '{lang}/{name}.module.json' },
      ['en-GB'],
    );

    expect(result.files.get('en-GB')).toBe(
      path.resolve('/workspace', 'locales', 'en-GB/admin.module.json'),
    );
  });

  it('should handle omitted scope name', () => {
    const result = resolveScope(workspaceRoot, { dir: 'i18n' }, ['en']);

    expect(result.name).toBe('');
    expect(result.files.get('en')).toBe(path.resolve('/workspace', 'i18n', 'en.json'));
  });
});
