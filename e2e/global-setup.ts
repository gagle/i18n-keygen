import { execSync } from 'node:child_process';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

export function teardown(): void {
  execSync('npx nx daemon --stop', { cwd: ROOT, stdio: 'ignore' });
}
