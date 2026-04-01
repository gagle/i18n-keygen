import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

interface RunResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

interface AppConfig {
  readonly project: string;
  readonly appPath: string;
  readonly separator: string;
  readonly defaultLang: string;
  readonly langs: ReadonlyArray<string>;
  readonly coreFiles: Record<string, string>;
  readonly scopeKey: string | null;
  readonly strictSync: boolean;
}

const APPS: ReadonlyArray<AppConfig> = [
  {
    project: 'angular-transloco-scoped-strict-example',
    appPath: 'apps/angular-transloco-scoped-strict',
    separator: '.',
    defaultLang: 'en',
    langs: ['en', 'es'],
    coreFiles: {
      en: 'apps/angular-transloco-scoped-strict/i18n/core/en.json',
      es: 'apps/angular-transloco-scoped-strict/i18n/core/es.json',
    },
    scopeKey: null,
    strictSync: true,
  },
  {
    project: 'angular-transloco-global-example',
    appPath: 'apps/angular-transloco-global',
    separator: '.',
    defaultLang: 'en',
    langs: ['en', 'es'],
    coreFiles: {
      en: 'apps/angular-transloco-global/i18n/en.json',
      es: 'apps/angular-transloco-global/i18n/es.json',
    },
    scopeKey: 'core',
    strictSync: false,
  },
  {
    project: 'angular-i18next-example',
    appPath: 'apps/angular-i18next',
    separator: ':',
    defaultLang: 'en-GB',
    langs: ['en-GB', 'en'],
    coreFiles: {
      'en-GB': 'apps/angular-i18next/locales/en-GB/core.module.json',
      en: 'apps/angular-i18next/locales/en/core.module.json',
    },
    scopeKey: null,
    strictSync: false,
  },
  {
    project: 'react-i18next-example',
    appPath: 'apps/react-i18next',
    separator: ':',
    defaultLang: 'en-GB',
    langs: ['en-GB', 'en'],
    coreFiles: {
      'en-GB': 'apps/react-i18next/public/locales/en-GB/core.module.json',
      en: 'apps/react-i18next/public/locales/en/core.module.json',
    },
    scopeKey: null,
    strictSync: false,
  },
  {
    project: 'vue-i18next-example',
    appPath: 'apps/vue-i18next',
    separator: ':',
    defaultLang: 'en-GB',
    langs: ['en-GB', 'en'],
    coreFiles: {
      'en-GB': 'apps/vue-i18next/public/locales/en-GB/core.module.json',
      en: 'apps/vue-i18next/public/locales/en/core.module.json',
    },
    scopeKey: null,
    strictSync: false,
  },
];

function runI18nSafe(project: string): RunResult {
  try {
    const stdout = execSync(`npx nx run ${project}:i18n --skip-nx-cache`, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout: string; stderr: string; status: number };
    return {
      stdout: execError.stdout ?? '',
      stderr: execError.stderr ?? '',
      exitCode: execError.status ?? 1,
    };
  }
}

function readGenerated(appPath: string): string {
  return fs.readFileSync(
    path.join(ROOT, appPath, 'src/i18n/i18n-keys.generated.ts'),
    'utf-8',
  );
}

function toAbsolute(relativePath: string): string {
  return path.join(ROOT, relativePath);
}

function backupCoreFiles(coreFiles: Record<string, string>): Map<string, string> {
  const backups = new Map<string, string>();
  for (const relativePath of Object.values(coreFiles)) {
    const absPath = toAbsolute(relativePath);
    backups.set(absPath, fs.readFileSync(absPath, 'utf-8'));
  }
  return backups;
}

function restoreFiles(backups: Map<string, string>): void {
  for (const [filePath, content] of backups) {
    fs.writeFileSync(filePath, content);
  }
}

function mutateTranslation(
  relativePath: string,
  scopeKey: string | null,
  mutation: (target: Record<string, unknown>) => void,
): void {
  const absPath = toAbsolute(relativePath);
  const json = JSON.parse(fs.readFileSync(absPath, 'utf-8')) as Record<string, unknown>;
  const target = scopeKey ? (json[scopeKey] as Record<string, unknown>) : json;
  mutation(target);
  fs.writeFileSync(absPath, JSON.stringify(json, null, 2) + '\n');
}

describe('sync validation', () => {
  for (const app of APPS) {
    describe(app.project, () => {
      describe('when key is added to default language only', () => {
        let backups: Map<string, string>;
        let result: RunResult;

        beforeAll(() => {
          backups = backupCoreFiles(app.coreFiles);
          mutateTranslation(app.coreFiles[app.defaultLang], app.scopeKey, (target) => {
            target['testKey'] = 'Test value';
          });
          result = runI18nSafe(app.project);
        });

        afterAll(() => restoreFiles(backups));

        if (app.strictSync) {
          it('should fail with non-zero exit code', () => {
            expect(result.exitCode).not.toBe(0);
          });

          it('should not include the unsynced key in generated type', () => {
            const content = readGenerated(app.appPath);
            expect(content).not.toContain(`'core${app.separator}testKey'`);
          });
        } else {
          it('should succeed with zero exit code', () => {
            expect(result.exitCode).toBe(0);
          });

          it('should include the unsynced key in generated type', () => {
            const content = readGenerated(app.appPath);
            expect(content).toContain(`'core${app.separator}testKey'`);
          });
        }

        if (app.strictSync) {
          it('should exclude all keys from the failing scope', () => {
            const content = readGenerated(app.appPath);
            expect(content).not.toContain(`'core${app.separator}appTitle'`);
            expect(content).not.toContain(`'core${app.separator}dialog.cancel'`);
          });
        } else {
          it('should retain all previously synced keys', () => {
            const content = readGenerated(app.appPath);
            expect(content).toContain(`'core${app.separator}appTitle'`);
            expect(content).toContain(`'core${app.separator}dialog.cancel'`);
          });
        }
      });

      describe('when key is added to all languages', () => {
        let backups: Map<string, string>;
        let result: RunResult;

        beforeAll(() => {
          backups = backupCoreFiles(app.coreFiles);
          for (const lang of app.langs) {
            mutateTranslation(app.coreFiles[lang], app.scopeKey, (target) => {
              target['testKey'] = `Test ${lang}`;
            });
          }
          result = runI18nSafe(app.project);
        });

        afterAll(() => restoreFiles(backups));

        it('should succeed with zero exit code', () => {
          expect(result.exitCode).toBe(0);
        });

        it('should include the new key in generated type', () => {
          const content = readGenerated(app.appPath);
          expect(content).toContain(`'core${app.separator}testKey'`);
        });
      });

      describe('when nested keys are added to all languages', () => {
        let backups: Map<string, string>;
        let result: RunResult;

        beforeAll(() => {
          backups = backupCoreFiles(app.coreFiles);
          for (const lang of app.langs) {
            mutateTranslation(app.coreFiles[lang], app.scopeKey, (target) => {
              target['filters'] = {
                category: `Category ${lang}`,
                priceRange: { min: `Min ${lang}`, max: `Max ${lang}` },
              };
            });
          }
          result = runI18nSafe(app.project);
        });

        afterAll(() => restoreFiles(backups));

        it('should succeed with zero exit code', () => {
          expect(result.exitCode).toBe(0);
        });

        it('should include all nested keys in generated type', () => {
          const content = readGenerated(app.appPath);
          expect(content).toContain(`'core${app.separator}filters.category'`);
          expect(content).toContain(`'core${app.separator}filters.priceRange.min'`);
          expect(content).toContain(`'core${app.separator}filters.priceRange.max'`);
        });
      });

      describe('when existing key is removed from non-default language', () => {
        let backups: Map<string, string>;
        let result: RunResult;

        beforeAll(() => {
          backups = backupCoreFiles(app.coreFiles);
          const nonDefaultLangs = app.langs.filter((lang) => lang !== app.defaultLang);
          mutateTranslation(app.coreFiles[nonDefaultLangs[0]], app.scopeKey, (target) => {
            delete (target['dialog'] as Record<string, unknown>)['confirm'];
          });
          result = runI18nSafe(app.project);
        });

        afterAll(() => restoreFiles(backups));

        if (app.strictSync) {
          it('should fail with non-zero exit code', () => {
            expect(result.exitCode).not.toBe(0);
          });

          it('should exclude the removed key from generated type', () => {
            const content = readGenerated(app.appPath);
            expect(content).not.toContain(`'core${app.separator}dialog.confirm'`);
          });
        } else {
          it('should succeed with zero exit code', () => {
            expect(result.exitCode).toBe(0);
          });

          it('should include the key in generated type from default language', () => {
            const content = readGenerated(app.appPath);
            expect(content).toContain(`'core${app.separator}dialog.confirm'`);
          });
        }

        if (app.strictSync) {
          it('should exclude all keys from the failing scope', () => {
            const content = readGenerated(app.appPath);
            expect(content).not.toContain(`'core${app.separator}dialog.cancel'`);
            expect(content).not.toContain(`'core${app.separator}appTitle'`);
          });
        } else {
          it('should retain keys that exist in all languages', () => {
            const content = readGenerated(app.appPath);
            expect(content).toContain(`'core${app.separator}dialog.cancel'`);
            expect(content).toContain(`'core${app.separator}appTitle'`);
          });
        }
      });

      describe('when orphaned key is added to non-default language only', () => {
        let backups: Map<string, string>;
        let result: RunResult;

        beforeAll(() => {
          backups = backupCoreFiles(app.coreFiles);
          const nonDefaultLangs = app.langs.filter((lang) => lang !== app.defaultLang);
          mutateTranslation(app.coreFiles[nonDefaultLangs[0]], app.scopeKey, (target) => {
            target['orphanedKey'] = 'Should not exist';
          });
          result = runI18nSafe(app.project);
        });

        afterAll(() => restoreFiles(backups));

        it('should fail with non-zero exit code', () => {
          expect(result.exitCode).not.toBe(0);
        });

        it('should not include the orphaned key in generated type', () => {
          const content = readGenerated(app.appPath);
          expect(content).not.toContain(`'core${app.separator}orphanedKey'`);
        });

        if (app.strictSync) {
          it('should exclude all keys from the failing scope', () => {
            const content = readGenerated(app.appPath);
            expect(content).not.toContain(`'core${app.separator}appTitle'`);
          });
        } else {
          it('should retain all previously synced keys', () => {
            const content = readGenerated(app.appPath);
            expect(content).toContain(`'core${app.separator}appTitle'`);
          });
        }
      });
    });
  }
});
