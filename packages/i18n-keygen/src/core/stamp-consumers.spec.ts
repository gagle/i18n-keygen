import * as fs from 'node:fs';
import * as path from 'node:path';
import { stampConsumerFiles } from './stamp-consumers';
import { createTmpDir, cleanTmpDir } from './testing/test-helpers';

function writeFile(tmpDir: string, relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function readFile(tmpDir: string, relativePath: string): string {
  return fs.readFileSync(path.join(tmpDir, relativePath), 'utf-8');
}

const STAMP_COMMENT =
  '// DO NOT DELETE (forces dev-server to detect i18n type changes) — https://github.com/gagle/i18n-keygen#where-errors-surface';

describe('stampConsumerFiles', () => {
  const TMP_NAME = 'stamp-consumers';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  describe('direct consumers', () => {
    it('should stamp files that import from the generated file', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'i18n/pipe.ts');
      expect(content).toContain(STAMP_COMMENT);
      expect(content).toContain("export const I18N_KEYS_STAMP = 'abc123';");
    });

    it('should not stamp files that do not import from the generated file', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(tmpDir, 'i18n/unrelated.ts', "import { foo } from './other';\n");

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'i18n/unrelated.ts');
      expect(content).not.toContain('I18N_KEYS_STAMP');
    });

    it('should not stamp the generated file itself', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'i18n/keys.ts');
      expect(content).not.toContain('I18N_KEYS_STAMP');
    });

    it('should update existing stamp when fingerprint changes', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        `import type { I18nKey } from './keys';\nexport class Pipe {}\n\n${STAMP_COMMENT}\nexport const I18N_KEYS_STAMP = 'old';\n`,
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'new123');

      const content = readFile(tmpDir, 'i18n/pipe.ts');
      expect(content).toContain("export const I18N_KEYS_STAMP = 'new123';");
      expect(content).not.toContain("'old'");
    });

    it('should skip writing when stamp is already current', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        `import type { I18nKey } from './keys';\nexport class Pipe {}\n\n${STAMP_COMMENT}\nexport const I18N_KEYS_STAMP = 'abc123';\n`,
      );
      const filePath = path.join(tmpDir, 'i18n/pipe.ts');
      const mtimeBefore = fs.statSync(filePath).mtimeMs;

      const startTime = Date.now();
      while (Date.now() - startTime < 50) {
        // busy wait to ensure filesystem timestamp would differ
      }

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const mtimeAfter = fs.statSync(filePath).mtimeMs;
      expect(mtimeAfter).toBe(mtimeBefore);
    });

    it('should place stamp at the end of the file', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const lines = readFile(tmpDir, 'i18n/pipe.ts').split('\n');
      const nonEmptyLines = lines.filter((line) => line.trim() !== '');
      expect(nonEmptyLines[nonEmptyLines.length - 2]).toBe(STAMP_COMMENT);
      expect(nonEmptyLines[nonEmptyLines.length - 1]).toBe(
        "export const I18N_KEYS_STAMP = 'abc123';",
      );
    });

    it('should have a blank line before the stamp comment', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'i18n/pipe.ts');
      expect(content).toContain(`}\n\n${STAMP_COMMENT}\nexport const I18N_KEYS_STAMP`);
    });

    it('should backfill comment when stamp exists without comment', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\nexport const I18N_KEYS_STAMP = 'abc123' as const;\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'i18n/pipe.ts');
      expect(content).toContain(STAMP_COMMENT);
      expect(content).toContain("export const I18N_KEYS_STAMP = 'abc123';");
    });

    it('should replace outdated comment when stamp exists with old comment', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n\n// OLD COMMENT\nexport const I18N_KEYS_STAMP = 'old';\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'new123');

      const content = readFile(tmpDir, 'i18n/pipe.ts');
      expect(content).not.toContain('OLD COMMENT');
      expect(content).toContain(STAMP_COMMENT);
      expect(content).toContain("export const I18N_KEYS_STAMP = 'new123';");
    });
  });

  describe('transitive consumers', () => {
    it('should stamp files that import from direct consumers', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'app/component.ts',
        "import { Pipe } from '../i18n/pipe';\nexport class App {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'app/component.ts');
      expect(content).toContain(STAMP_COMMENT);
      expect(content).toContain("export const I18N_KEYS_STAMP = 'abc123';");
    });

    it('should not stamp files in node_modules', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'node_modules/lib/index.ts',
        "import { Pipe } from '../../i18n/pipe';\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'node_modules/lib/index.ts');
      expect(content).not.toContain('I18N_KEYS_STAMP');
    });

    it('should not stamp files in dot directories', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        '.hidden/component.ts',
        "import { Pipe } from '../i18n/pipe';\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, '.hidden/component.ts');
      expect(content).not.toContain('I18N_KEYS_STAMP');
    });

    it('should stamp deeply nested transitive consumers', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'features/deep/nested/component.ts',
        "import { Pipe } from '../../../i18n/pipe';\nexport class Deep {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'features/deep/nested/component.ts');
      expect(content).toContain(STAMP_COMMENT);
      expect(content).toContain("export const I18N_KEYS_STAMP = 'abc123';");
    });

    it('should not stamp files that do not import from stamped files', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'app/unrelated.ts',
        "import { Something } from '../other/module';\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123');

      const content = readFile(tmpDir, 'app/unrelated.ts');
      expect(content).not.toContain('I18N_KEYS_STAMP');
    });
  });

  describe('targetConsumer', () => {
    it('should stamp only the specified consumer file', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'i18n/service.ts',
        "import type { I18nKey } from './keys';\nexport class Service {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123', 'pipe.ts');

      const pipe = readFile(tmpDir, 'i18n/pipe.ts');
      expect(pipe).toContain("export const I18N_KEYS_STAMP = 'abc123';");

      const service = readFile(tmpDir, 'i18n/service.ts');
      expect(service).not.toContain('I18N_KEYS_STAMP');
    });

    it('should still stamp transitive consumers of the specified file', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');
      writeFile(
        tmpDir,
        'i18n/pipe.ts',
        "import type { I18nKey } from './keys';\nexport class Pipe {}\n",
      );
      writeFile(
        tmpDir,
        'app/component.ts',
        "import { Pipe } from '../i18n/pipe';\nexport class App {}\n",
      );

      stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123', 'pipe.ts');

      const component = readFile(tmpDir, 'app/component.ts');
      expect(component).toContain("export const I18N_KEYS_STAMP = 'abc123';");
    });

    it('should not throw when target consumer does not exist', () => {
      writeFile(tmpDir, 'i18n/keys.ts', 'export type I18nKey = never;\n');

      expect(() => {
        stampConsumerFiles(path.join(tmpDir, 'i18n/keys.ts'), 'abc123', 'nonexistent.ts');
      }).not.toThrow();
    });
  });

  describe('when output directory does not exist', () => {
    it('should not throw', () => {
      expect(() => {
        stampConsumerFiles(path.join(tmpDir, 'nonexistent/keys.ts'), 'abc123');
      }).not.toThrow();
    });
  });
});
