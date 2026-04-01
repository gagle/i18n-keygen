import * as fs from 'node:fs';
import * as path from 'node:path';
import pc from 'picocolors';
import { log } from '../utilities/logger';

export interface WriteResult {
  readonly changed: boolean;
}

export function writeOutput(
  outputFile: string,
  content: string,
  keyCount: number,
  workspaceRoot: string,
): WriteResult {
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const existing = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf-8') : '';
  const relativePath = path.relative(workspaceRoot, outputFile);
  const changed = existing !== content;

  if (changed) {
    fs.writeFileSync(outputFile, content);
  }

  const message = changed
    ? `${pc.green(`✔ Generated ${keyCount} keys`)} → ${relativePath}`
    : pc.dim(`✔ ${keyCount} keys (unchanged) → ${relativePath}`);
  log(message);

  return { changed };
}
