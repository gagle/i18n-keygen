import { resolveConfig } from './resolve-config';

describe('resolveConfig', () => {
  it('should apply default values when optional fields are missing', () => {
    const result = resolveConfig({
      outputFile: 'keys.ts',
      scopes: [{ name: 'core', dir: 'i18n' }],
      supportedLangs: ['en'],
    });

    expect(result).toEqual({
      outputFile: 'keys.ts',
      scopes: [{ name: 'core', dir: 'i18n' }],
      supportedLangs: ['en'],
      defaultLang: 'en',
      scopeSeparator: '.',
      strictSync: false,
    });
  });

  it('should preserve explicitly set values', () => {
    const result = resolveConfig({
      outputFile: 'keys.ts',
      scopes: [{ name: 'core', dir: 'i18n' }],
      supportedLangs: ['en', 'es'],
      defaultLang: 'es',
      scopeSeparator: ':',
      strictSync: true,
    });

    expect(result.defaultLang).toBe('es');
    expect(result.scopeSeparator).toBe(':');
    expect(result.strictSync).toBe(true);
  });

  it('should pass through stampConsumer when provided', () => {
    const result = resolveConfig({
      outputFile: 'keys.ts',
      scopes: [{ name: 'core', dir: 'i18n' }],
      supportedLangs: ['en'],
      stampConsumer: 'i18n.pipe.ts',
    });

    expect(result.stampConsumer).toBe('i18n.pipe.ts');
  });

  it('should leave stampConsumer undefined when not provided', () => {
    const result = resolveConfig({
      outputFile: 'keys.ts',
      scopes: [{ name: 'core', dir: 'i18n' }],
      supportedLangs: ['en'],
    });

    expect(result.stampConsumer).toBeUndefined();
  });
});
