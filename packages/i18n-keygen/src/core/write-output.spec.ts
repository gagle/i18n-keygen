import * as fs from 'node:fs';
import * as path from 'node:path';
import { writeOutput } from './write-output';
import { createTmpDir, cleanTmpDir } from './testing/test-helpers';

describe('writeOutput', () => {
  const TMP_NAME = 'write-output';
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir(TMP_NAME);
    vi.spyOn(console, 'log').mockReturnValue();
  });

  afterEach(() => {
    cleanTmpDir(TMP_NAME);
  });

  describe('when the output file does not exist', () => {
    it('should create the file with the given content', () => {
      const outputFile = path.join(tmpDir, 'generated/keys.ts');

      writeOutput(outputFile, 'export type T = never;\n', 0, tmpDir);

      expect(fs.readFileSync(outputFile, 'utf-8')).toBe('export type T = never;\n');
    });

    it('should return changed true', () => {
      const outputFile = path.join(tmpDir, 'generated/keys.ts');

      const result = writeOutput(outputFile, 'export type T = never;\n', 0, tmpDir);

      expect(result.changed).toBe(true);
    });

    it('should create nested directories', () => {
      const outputFile = path.join(tmpDir, 'deep/nested/dir/keys.ts');

      writeOutput(outputFile, 'content', 0, tmpDir);

      expect(fs.existsSync(outputFile)).toBe(true);
    });
  });

  describe('when the output file already exists with different content', () => {
    beforeEach(() => {
      const outputFile = path.join(tmpDir, 'keys.ts');
      fs.writeFileSync(outputFile, 'old content');
    });

    it('should overwrite with new content', () => {
      const outputFile = path.join(tmpDir, 'keys.ts');

      writeOutput(outputFile, 'new content', 1, tmpDir);

      expect(fs.readFileSync(outputFile, 'utf-8')).toBe('new content');
    });

    it('should return changed true', () => {
      const outputFile = path.join(tmpDir, 'keys.ts');

      const result = writeOutput(outputFile, 'new content', 1, tmpDir);

      expect(result.changed).toBe(true);
    });
  });

  describe('when the output file already exists with identical content', () => {
    const content = 'same content';

    beforeEach(() => {
      const outputFile = path.join(tmpDir, 'keys.ts');
      fs.writeFileSync(outputFile, content);
    });

    it('should not write the file', () => {
      const outputFile = path.join(tmpDir, 'keys.ts');
      const mtimeBefore = fs.statSync(outputFile).mtimeMs;

      const startTime = Date.now();
      while (Date.now() - startTime < 50) {
        // busy wait to ensure filesystem timestamp would differ
      }

      writeOutput(outputFile, content, 1, tmpDir);
      const mtimeAfter = fs.statSync(outputFile).mtimeMs;

      expect(mtimeAfter).toBe(mtimeBefore);
    });

    it('should return changed false', () => {
      const outputFile = path.join(tmpDir, 'keys.ts');

      const result = writeOutput(outputFile, content, 1, tmpDir);

      expect(result.changed).toBe(false);
    });
  });
});
