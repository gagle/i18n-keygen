import * as fs from 'node:fs';
import * as path from 'node:path';
import { generate } from './generate';
import type { ResolvedConfig } from './types';
import { createTmpDir, cleanTmpDir, writeJson } from './testing/test-helpers';

function makeOptions(tmpDir: string, overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    outputFile: 'generated/keys.ts',
    scopes: [{ name: 'core', dir: 'i18n/core' }],
    supportedLangs: ['en', 'es'],
    defaultLang: 'en',
    scopeSeparator: '.',
    strictSync: false,
    ...overrides,
  };
}

describe('generate', () => {
  const TMP_NAME = 'generate';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  function readOutput(relativePath: string): string {
    return fs.readFileSync(path.join(tmpDir, relativePath), 'utf-8');
  }

  it('should generate keys with scope prefix', () => {
    writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', nav: { home: 'Home' } });
    writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola', nav: { home: 'Inicio' } });

    const success = generate(tmpDir, makeOptions(tmpDir));

    expect(success).toBe(true);
    const output = readOutput('generated/keys.ts');
    expect(output).toContain("'core.title'");
    expect(output).toContain("'core.nav.home'");
  });

  it('should generate keys without prefix when scope name is empty', () => {
    writeJson(tmpDir, 'i18n/en.json', { title: 'Hello', buttons: { save: 'Save' } });
    writeJson(tmpDir, 'i18n/es.json', { title: 'Hola', buttons: { save: 'Guardar' } });

    const success = generate(
      tmpDir,
      makeOptions(tmpDir, { scopes: [{ dir: 'i18n' }] }),
    );

    expect(success).toBe(true);
    const output = readOutput('generated/keys.ts');
    expect(output).toContain("'title'");
    expect(output).toContain("'buttons.save'");
    expect(output).not.toContain("'.title'");
  });

  it('should support custom filePattern for i18next-style layouts', () => {
    writeJson(tmpDir, 'locales/en-GB/cdk.module.json', { dialog: { close: 'Close' } });
    writeJson(tmpDir, 'locales/en/cdk.module.json', { dialog: { close: 'Close' } });

    const success = generate(
      tmpDir,
      makeOptions(tmpDir, {
        scopes: [{ name: 'cdk', dir: 'locales', filePattern: '{lang}/cdk.module.json' }],
        supportedLangs: ['en-GB', 'en'],
        defaultLang: 'en-GB',
      }),
    );

    expect(success).toBe(true);
    const output = readOutput('generated/keys.ts');
    expect(output).toContain("'cdk.dialog.close'");
  });

  it('should generate never type for empty scopes', () => {
    const success = generate(tmpDir, makeOptions(tmpDir, { scopes: [] }));

    expect(success).toBe(true);
    const output = readOutput('generated/keys.ts');
    expect(output).toContain('export type I18nKey = never;');
  });

  it('should use colon separator when scopeSeparator is ":"', () => {
    writeJson(tmpDir, 'locales/en-GB/cdk.module.json', { dialog: { close: 'Close' } });
    writeJson(tmpDir, 'locales/en/cdk.module.json', { dialog: { close: 'Close' } });

    const success = generate(
      tmpDir,
      makeOptions(tmpDir, {
        scopes: [{ name: 'cdk', dir: 'locales', filePattern: '{lang}/cdk.module.json' }],
        supportedLangs: ['en-GB', 'en'],
        defaultLang: 'en-GB',
        scopeSeparator: ':',
      }),
    );

    expect(success).toBe(true);
    const output = readOutput('generated/keys.ts');
    expect(output).toContain("'cdk:dialog.close'");
    expect(output).not.toContain("'cdk.dialog.close'");
  });

  it('should sort keys alphabetically across scopes', () => {
    writeJson(tmpDir, 'i18n/beta/en.json', { title: 'Beta' });
    writeJson(tmpDir, 'i18n/beta/es.json', { title: 'Beta' });
    writeJson(tmpDir, 'i18n/alpha/en.json', { title: 'Alpha' });
    writeJson(tmpDir, 'i18n/alpha/es.json', { title: 'Alpha' });

    generate(
      tmpDir,
      makeOptions(tmpDir, {
        scopes: [
          { name: 'beta', dir: 'i18n/beta' },
          { name: 'alpha', dir: 'i18n/alpha' },
        ],
      }),
    );

    const output = readOutput('generated/keys.ts');
    const alphaIdx = output.indexOf("'alpha.title'");
    const betaIdx = output.indexOf("'beta.title'");
    expect(alphaIdx).toBeLessThan(betaIdx);
  });

  it('should create output directory when it does not exist', () => {
    writeJson(tmpDir, 'i18n/en.json', { key: 'value' });
    writeJson(tmpDir, 'i18n/es.json', { key: 'valor' });

    generate(
      tmpDir,
      makeOptions(tmpDir, {
        outputFile: 'deep/nested/dir/keys.ts',
        scopes: [{ dir: 'i18n' }],
      }),
    );

    expect(fs.existsSync(path.join(tmpDir, 'deep/nested/dir/keys.ts'))).toBe(true);
  });

  it('should not rewrite file when content has not changed', () => {
    writeJson(tmpDir, 'i18n/en.json', { title: 'Hello' });
    writeJson(tmpDir, 'i18n/es.json', { title: 'Hola' });

    const opts = makeOptions(tmpDir, { scopes: [{ name: '', dir: 'i18n' }] });

    generate(tmpDir, opts);
    const outputPath = path.join(tmpDir, 'generated/keys.ts');
    const mtimeBefore = fs.statSync(outputPath).mtimeMs;

    const startTime = Date.now();
    while (Date.now() - startTime < 50) {
      // busy wait to ensure filesystem timestamp would differ
    }

    generate(tmpDir, opts);
    const mtimeAfter = fs.statSync(outputPath).mtimeMs;

    expect(mtimeAfter).toBe(mtimeBefore);
  });

  describe('default mode (strictSync: false)', () => {
    it('should succeed and use all default lang keys when non-default lang has missing keys', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', newKey: 'New' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });

      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(true);
      const output = readOutput('generated/keys.ts');
      expect(output).toContain("'core.title'");
      expect(output).toContain("'core.newKey'");
    });

    it('should succeed and use all default lang keys when non-default lang file is empty', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', nav: { home: 'Home' } });
      writeJson(tmpDir, 'i18n/core/es.json', {});

      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(true);
      const output = readOutput('generated/keys.ts');
      expect(output).toContain("'core.title'");
      expect(output).toContain("'core.nav.home'");
    });

    it('should fail when non-default lang has orphaned keys', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola', orphaned: 'Extra' });

      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(false);
    });

    it('should use default lang keys even when orphaned keys cause failure', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola', orphaned: 'Extra' });

      generate(tmpDir, makeOptions(tmpDir));

      const output = readOutput('generated/keys.ts');
      expect(output).toContain("'core.title'");
    });

    it('should fail on orphaned but succeed on missing in the same scope', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', newKey: 'New' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola', orphaned: 'Extra' });

      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(false);
      const output = readOutput('generated/keys.ts');
      expect(output).toContain("'core.title'");
      expect(output).toContain("'core.newKey'");
    });

    it('should succeed with mixed scopes when one is synced and one has missing keys', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', newKey: 'New' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });
      writeJson(tmpDir, 'i18n/shared/en.json', { save: 'Save' });
      writeJson(tmpDir, 'i18n/shared/es.json', { save: 'Guardar' });

      const success = generate(
        tmpDir,
        makeOptions(tmpDir, {
          scopes: [
            { name: 'core', dir: 'i18n/core' },
            { name: 'shared', dir: 'i18n/shared' },
          ],
        }),
      );

      expect(success).toBe(true);
      const output = readOutput('generated/keys.ts');
      expect(output).toContain("'core.title'");
      expect(output).toContain("'core.newKey'");
      expect(output).toContain("'shared.save'");
    });

    it('should still fail when default lang file is missing', () => {
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });

      const success = generate(tmpDir, makeOptions(tmpDir));

      expect(success).toBe(false);
    });
  });

  describe('when a JSON file contains invalid content', () => {
    it('should skip writing the output file', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      const esPath = path.join(tmpDir, 'i18n/core/es.json');
      fs.mkdirSync(path.dirname(esPath), { recursive: true });
      fs.writeFileSync(esPath, '{ invalid json }');

      generate(tmpDir, makeOptions(tmpDir));

      expect(fs.existsSync(path.join(tmpDir, 'generated/keys.ts'))).toBe(false);
    });

    it('should preserve existing output when a file becomes unreadable', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });

      generate(tmpDir, makeOptions(tmpDir));
      const outputPath = path.join(tmpDir, 'generated/keys.ts');
      const goodOutput = fs.readFileSync(outputPath, 'utf-8');

      fs.writeFileSync(path.join(tmpDir, 'i18n/core/es.json'), '{ broken }');
      generate(tmpDir, makeOptions(tmpDir));

      expect(fs.readFileSync(outputPath, 'utf-8')).toBe(goodOutput);
    });
  });

  describe('when strictSync is true', () => {
    it('should emit no keys for the failing scope when there are missing keys', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', newKey: 'New' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });

      const success = generate(tmpDir, makeOptions(tmpDir, { strictSync: true }));

      expect(success).toBe(false);
      const output = readOutput('generated/keys.ts');
      expect(output).not.toContain("'core.title'");
      expect(output).not.toContain("'core.newKey'");
    });

    it('should emit no keys for the failing scope when non-default lang has orphaned keys', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola', orphanedKey: 'Extra' });

      const success = generate(tmpDir, makeOptions(tmpDir, { strictSync: true }));

      expect(success).toBe(false);
      const output = readOutput('generated/keys.ts');
      expect(output).not.toContain("'core.title'");
    });

    it('should emit no keys for the failing scope and full keys for the synced scope', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello', newKey: 'New' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });
      writeJson(tmpDir, 'i18n/shared/en.json', { save: 'Save', cancel: 'Cancel' });
      writeJson(tmpDir, 'i18n/shared/es.json', { save: 'Guardar', cancel: 'Cancelar' });

      const success = generate(
        tmpDir,
        makeOptions(tmpDir, {
          strictSync: true,
          scopes: [
            { name: 'core', dir: 'i18n/core' },
            { name: 'shared', dir: 'i18n/shared' },
          ],
        }),
      );

      expect(success).toBe(false);
      const output = readOutput('generated/keys.ts');
      expect(output).not.toContain("'core.");
      expect(output).toContain("'shared.save'");
      expect(output).toContain("'shared.cancel'");
    });
  });

  describe('consumer stamping', () => {
    it('should stamp consumer files that import from the generated file', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });
      fs.mkdirSync(path.join(tmpDir, 'generated'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'generated/consumer.ts'),
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );

      generate(tmpDir, makeOptions(tmpDir));

      const consumer = fs.readFileSync(path.join(tmpDir, 'generated/consumer.ts'), 'utf-8');
      expect(consumer).toMatch(/export const I18N_KEYS_STAMP = '[a-z0-9]+';/);
    });

    it('should not stamp files that do not import from the generated file', () => {
      writeJson(tmpDir, 'i18n/core/en.json', { title: 'Hello' });
      writeJson(tmpDir, 'i18n/core/es.json', { title: 'Hola' });
      fs.mkdirSync(path.join(tmpDir, 'generated'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'generated/unrelated.ts'),
        "import { foo } from './other';\n",
      );

      generate(tmpDir, makeOptions(tmpDir));

      const unrelated = fs.readFileSync(path.join(tmpDir, 'generated/unrelated.ts'), 'utf-8');
      expect(unrelated).not.toContain('I18N_KEYS_STAMP');
    });
  });

});
