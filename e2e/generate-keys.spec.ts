import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

function runI18n(project: string): string {
  return execSync(`npx nx run ${project}:i18n`, {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function readGenerated(appPath: string): string {
  return fs.readFileSync(
    path.join(ROOT, appPath, 'src/i18n/i18n-keys.generated.ts'),
    'utf-8',
  );
}

describe('generate-keys executor', () => {
  describe('angular-transloco-scoped-strict', () => {
    beforeAll(() => {
      runI18n('angular-transloco-scoped-strict-example');
    });

    it('should generate keys with dot-separated scoped prefixes', () => {
      const content = readGenerated('apps/angular-transloco-scoped-strict');
      expect(content).toContain("'core.");
      expect(content).toContain("'products.");
      expect(content).toContain("'orders.");
    });

    it('should export a I18nKey type', () => {
      const content = readGenerated('apps/angular-transloco-scoped-strict');
      expect(content).toMatch(/^export type I18nKey =/m);
    });
  });

  describe('angular-transloco-global', () => {
    beforeAll(() => {
      runI18n('angular-transloco-global-example');
    });

    it('should generate keys without scope prefix', () => {
      const content = readGenerated('apps/angular-transloco-global');
      expect(content).not.toContain("'.");
      expect(content).toMatch(/\| '[\w.]+'/);
    });
  });

  describe('angular-i18next', () => {
    beforeAll(() => {
      runI18n('angular-i18next-example');
    });

    it('should generate keys with colon-separated namespace prefixes', () => {
      const content = readGenerated('apps/angular-i18next');
      expect(content).toContain("'core:");
      expect(content).toContain("'products:");
      expect(content).toContain("'orders:");
    });
  });

  describe('react-i18next', () => {
    beforeAll(() => {
      runI18n('react-i18next-example');
    });

    it('should generate keys with colon-separated namespace prefixes', () => {
      const content = readGenerated('apps/react-i18next');
      expect(content).toContain("'core:");
      expect(content).toContain("'products:");
      expect(content).toContain("'orders:");
    });
  });

  describe('vue-i18next', () => {
    beforeAll(() => {
      runI18n('vue-i18next-example');
    });

    it('should generate keys with colon-separated namespace prefixes', () => {
      const content = readGenerated('apps/vue-i18next');
      expect(content).toContain("'core:");
      expect(content).toContain("'products:");
      expect(content).toContain("'orders:");
    });
  });

});
