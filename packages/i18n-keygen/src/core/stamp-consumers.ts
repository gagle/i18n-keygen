import * as fs from 'node:fs';
import * as path from 'node:path';

const STAMP_PREFIX = 'export const I18N_KEYS_STAMP = ';
const STAMP_COMMENT =
  '// DO NOT DELETE (forces dev-server to detect i18n type changes) — https://github.com/gagle/i18n-keygen#where-errors-surface';

export function stampConsumerFiles(
  outputFile: string,
  fingerprint: string,
  targetConsumer?: string,
): void {
  const outputDir = path.dirname(outputFile);
  const stamp = `${STAMP_PREFIX}'${fingerprint}';`;

  let stampedFiles: Array<string>;

  if (targetConsumer) {
    const filePath = path.join(outputDir, targetConsumer);
    stampedFiles = stampSingleConsumer(filePath, stamp);
  } else {
    const outputBasename = path.basename(outputFile, '.ts');
    stampedFiles = stampDirectConsumers(outputDir, outputBasename, stamp);
  }

  if (stampedFiles.length > 0) {
    stampTransitiveConsumers(path.dirname(outputDir), outputDir, stampedFiles, stamp);
  }
}

function stampSingleConsumer(filePath: string, stamp: string): Array<string> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }
  writeStamp(filePath, content, stamp);
  return [filePath];
}

function stampDirectConsumers(
  outputDir: string,
  outputBasename: string,
  stamp: string,
): Array<string> {
  const importSuffix = `./${outputBasename}`;
  let entries: Array<string>;
  try {
    entries = fs.readdirSync(outputDir);
  } catch {
    return [];
  }

  const tsFiles = entries.filter(
    (entry) => entry.endsWith('.ts') && entry !== `${outputBasename}.ts`,
  );
  const stamped: Array<string> = [];

  for (const tsFile of tsFiles) {
    const filePath = path.join(outputDir, tsFile);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(importSuffix)) {
      continue;
    }
    if (writeStamp(filePath, content, stamp)) {
      stamped.push(filePath);
    }
  }

  return stamped;
}

function stampTransitiveConsumers(
  scanRoot: string,
  excludeDir: string,
  stampedFiles: ReadonlyArray<string>,
  stamp: string,
): void {
  const candidates = collectTsFiles(scanRoot, excludeDir);

  for (const filePath of candidates) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!importsAnyStampedFile(filePath, content, stampedFiles)) {
      continue;
    }
    writeStamp(filePath, content, stamp);
  }
}

function collectTsFiles(dir: string, excludeDir: string): Array<string> {
  const results: Array<string> = [];
  let entries: Array<fs.Dirent>;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || fullPath === excludeDir) {
        continue;
      }
      results.push(...collectTsFiles(fullPath, excludeDir));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}

function importsAnyStampedFile(
  filePath: string,
  content: string,
  stampedFiles: ReadonlyArray<string>,
): boolean {
  const fileDir = path.dirname(filePath);
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (!importPath || !importPath.startsWith('.')) {
      continue;
    }
    const resolved = path.resolve(fileDir, importPath);
    const resolvedWithTs = resolved.endsWith('.ts') ? resolved : `${resolved}.ts`;
    if (stampedFiles.includes(resolvedWithTs)) {
      return true;
    }
  }

  return false;
}

function findStampLineIndex(lines: ReadonlyArray<string>): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]?.startsWith(STAMP_PREFIX)) {
      return i;
    }
  }
  return -1;
}

function writeStamp(filePath: string, content: string, stamp: string): boolean {
  const lines = content.split('\n');
  const stampIndex = findStampLineIndex(lines);

  if (stampIndex >= 0) {
    const prevLine = stampIndex > 0 ? lines[stampIndex - 1] : undefined;
    const hasComment = prevLine === STAMP_COMMENT;
    const hasOldComment = !hasComment && prevLine !== undefined && prevLine.startsWith('//');
    const blankCheckIndex = hasComment || hasOldComment ? stampIndex - 2 : stampIndex - 1;
    const hasBlankLine = blankCheckIndex >= 0 && lines[blankCheckIndex] === '';

    if (lines[stampIndex] === stamp && hasComment && hasBlankLine) {
      return false;
    }

    if (hasComment || hasOldComment) {
      const spliceStart = hasBlankLine ? stampIndex - 2 : stampIndex - 1;
      const spliceCount = hasBlankLine ? 3 : 2;
      lines.splice(spliceStart, spliceCount, '', STAMP_COMMENT, stamp);
    } else {
      const needsBlankLine = stampIndex === 0 || lines[stampIndex - 1] !== '';
      const insertItems = needsBlankLine ? ['', STAMP_COMMENT, stamp] : [STAMP_COMMENT, stamp];
      lines.splice(stampIndex, 1, ...insertItems);
    }
  } else {
    const trailingNewline = lines[lines.length - 1] === '';
    const insertAt = trailingNewline ? lines.length - 1 : lines.length;
    lines.splice(insertAt, 0, '', STAMP_COMMENT, stamp);
    if (!trailingNewline) {
      lines.push('');
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'));
  return true;
}
