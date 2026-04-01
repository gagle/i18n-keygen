import { loadConfig } from './load-config';
import { createTmpDir, cleanTmpDir, writeJson } from './testing/test-helpers';

describe('loadConfig', () => {
  const TMP_NAME = 'load-config';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  describe('when config file is valid with all fields', () => {
    it('should return the parsed config', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en', 'es'],
        defaultLang: 'es',
        scopeSeparator: ':',
        scopes: [{ name: 'core', dir: 'i18n/core' }],
      });

      const config = loadConfig(tmpDir, 'i18n.config.json');

      expect(config).toEqual({
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en', 'es'],
        defaultLang: 'es',
        scopeSeparator: ':',
        strictSync: undefined,
        scopes: [{ name: 'core', dir: 'i18n/core' }],
      });
    });
  });

  describe('when config file has all fields including strictSync', () => {
    it('should return strictSync as true', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en', 'es'],
        scopes: [{ name: 'core', dir: 'i18n/core' }],
        strictSync: true,
      });

      const config = loadConfig(tmpDir, 'i18n.config.json');

      expect(config.strictSync).toBe(true);
    });
  });

  describe('when config file has deprecated partialTranslations', () => {
    it('should log a deprecation warning', () => {
      vi.spyOn(console, 'warn').mockReturnValue();
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en', 'es'],
        scopes: [{ name: 'core', dir: 'i18n/core' }],
        partialTranslations: true,
      });

      loadConfig(tmpDir, 'i18n.config.json');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('"partialTranslations" is deprecated'),
      );
    });
  });

  describe('when config file has only required fields', () => {
    it('should leave optional fields undefined', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en'],
        scopes: [{ dir: 'i18n' }],
      });

      const config = loadConfig(tmpDir, 'i18n.config.json');

      expect(config.defaultLang).toBeUndefined();
      expect(config.scopeSeparator).toBeUndefined();
      expect(config.strictSync).toBeUndefined();
      expect(config.stampConsumer).toBeUndefined();
    });
  });

  describe('when config file has stampConsumer', () => {
    it('should return stampConsumer value', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en', 'es'],
        scopes: [{ name: 'core', dir: 'i18n/core' }],
        stampConsumer: 'i18n.pipe.ts',
      });

      const config = loadConfig(tmpDir, 'i18n.config.json');

      expect(config.stampConsumer).toBe('i18n.pipe.ts');
    });
  });

  describe('when config file does not exist', () => {
    it('should throw', () => {
      expect(() => loadConfig(tmpDir, 'missing.json')).toThrow('Failed to read config file');
    });
  });

  describe('when config file is missing outputFile', () => {
    it('should throw', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        supportedLangs: ['en'],
        scopes: [{ dir: 'i18n' }],
      });

      expect(() => loadConfig(tmpDir, 'i18n.config.json')).toThrow('missing required "outputFile"');
    });
  });

  describe('when config file is missing scopes', () => {
    it('should throw', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        supportedLangs: ['en'],
      });

      expect(() => loadConfig(tmpDir, 'i18n.config.json')).toThrow('missing required "scopes"');
    });
  });

  describe('when config file is missing supportedLangs', () => {
    it('should throw', () => {
      writeJson(tmpDir, 'i18n.config.json', {
        outputFile: 'src/generated/keys.ts',
        scopes: [{ dir: 'i18n' }],
      });

      expect(() => loadConfig(tmpDir, 'i18n.config.json')).toThrow(
        'missing required "supportedLangs"',
      );
    });
  });
});
