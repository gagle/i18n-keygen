import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseJsonFile } from './parse-json';

describe('parseJsonFile', () => {
  const tmpDir = path.resolve(__dirname, '../../../.tmp-test-parse-json');

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    vi.spyOn(console, 'error').mockReturnValue();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('when the file contains valid JSON', () => {
    it('should return the parsed object', () => {
      const filePath = path.join(tmpDir, 'valid.json');
      fs.writeFileSync(filePath, '{"title": "Hello", "nested": {"key": "value"}}');

      const result = parseJsonFile(filePath, tmpDir);

      expect(result).toEqual({ title: 'Hello', nested: { key: 'value' } });
    });
  });

  describe('when the file does not exist', () => {
    it('should return null', () => {
      const result = parseJsonFile(path.join(tmpDir, 'missing.json'), tmpDir);

      expect(result).toBeNull();
    });

    it('should log the relative path in the error', () => {
      parseJsonFile(path.join(tmpDir, 'missing.json'), tmpDir);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('missing.json'),
      );
    });
  });

  describe('when the file contains invalid JSON', () => {
    it('should return null', () => {
      const filePath = path.join(tmpDir, 'bad.json');
      fs.writeFileSync(filePath, '{ invalid json }');

      const result = parseJsonFile(filePath, tmpDir);

      expect(result).toBeNull();
    });

    it('should log the relative path in the error', () => {
      const filePath = path.join(tmpDir, 'bad.json');
      fs.writeFileSync(filePath, '{ invalid json }');

      parseJsonFile(filePath, tmpDir);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('bad.json'),
      );
    });
  });
});
