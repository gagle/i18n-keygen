import * as path from 'node:path';

vi.mock('../utilities/parse-json', () => ({
  parseJsonFile: vi.fn(),
}));

vi.mock('../utilities/logger', () => ({
  log: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock('./validate-sync', () => ({
  validateCrossLanguageSync: vi.fn(),
}));

vi.mock('./write-output', () => ({
  writeOutput: vi.fn(),
}));

vi.mock('./resolve-scope', () => ({
  resolveScope: vi.fn(),
}));

import { parseJsonFile } from '../utilities/parse-json';
import { validateCrossLanguageSync } from './validate-sync';
import { writeOutput } from './write-output';
import { resolveScope } from './resolve-scope';
import { generate } from './generate';
import type { ResolvedConfig } from './types';
import { createTmpDir, cleanTmpDir, writeJson } from './testing/test-helpers';

function makeOptions(tmpDir: string, overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    outputFile: path.join(tmpDir, 'generated/keys.ts'),
    scopes: [{ dir: path.join(tmpDir, 'i18n') }],
    supportedLangs: ['en', 'es'],
    defaultLang: 'en',
    scopeSeparator: '.',
    strictSync: false,
    ...overrides,
  };
}

describe('generate edge cases', () => {
  const TMP_NAME = 'generate-edge';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
    vi.mocked(writeOutput).mockReturnValue({ changed: false });
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  describe('when resolved scope files map does not contain the default language', () => {
    beforeEach(() => {
      vi.mocked(resolveScope).mockReturnValue({
        name: 'core',
        files: new Map([['es', path.join(tmpDir, 'i18n/es.json')]]),
      });
      vi.mocked(validateCrossLanguageSync).mockReturnValue({
        errors: [],
        intersectionKeys: [],
        hasParseErrors: false,
      });
    });

    it('should return false', () => {
      const success = generate(
        tmpDir,
        makeOptions(tmpDir, {
          scopes: [{ name: 'core', dir: path.join(tmpDir, 'i18n') }],
          supportedLangs: ['es'],
          defaultLang: 'en',
        }),
      );

      expect(success).toBe(false);
    });
  });

  describe('when parseJsonFile returns null for the default language after validation passes', () => {
    beforeEach(() => {
      writeJson(tmpDir, 'i18n/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/es.json', { title: 'Hola' });
      vi.mocked(resolveScope).mockReturnValue({
        name: '',
        files: new Map([
          ['en', path.join(tmpDir, 'i18n/en.json')],
          ['es', path.join(tmpDir, 'i18n/es.json')],
        ]),
      });
      vi.mocked(validateCrossLanguageSync).mockReturnValue({
        errors: [],
        intersectionKeys: [],
        hasParseErrors: false,
      });
      vi.mocked(parseJsonFile).mockReturnValue(null);
    });

    it('should return false', () => {
      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(false);
    });

    it('should skip writing the output file', () => {
      vi.mocked(writeOutput).mockClear();

      generate(tmpDir, makeOptions(tmpDir));

      expect(writeOutput).not.toHaveBeenCalled();
    });
  });
});
