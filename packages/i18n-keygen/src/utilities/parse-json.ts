import * as fs from 'node:fs';
import * as path from 'node:path';
import { logError } from './logger';

export function parseJsonFile(filePath: string, workspaceRoot: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  } catch {
    logError(`✘ Invalid JSON: ${path.relative(workspaceRoot, filePath)}`);
    return null;
  }
}
