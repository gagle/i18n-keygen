import * as fs from 'node:fs';
import * as path from 'node:path';

const TMP_ROOT = path.resolve(__dirname, '../../../../../.tmp-test');

export function createTmpDir(name: string): string {
  const dir = path.join(TMP_ROOT, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function cleanTmpDir(name: string): void {
  const dir = path.join(TMP_ROOT, name);
  fs.rmSync(dir, { recursive: true, force: true });

  const remaining = fs.readdirSync(TMP_ROOT);
  if (remaining.length === 0) {
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  }
}

export function writeJson(
  tmpDir: string,
  relativePath: string,
  content: Record<string, unknown>,
): void {
  const filePath = path.join(tmpDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(content));
}
