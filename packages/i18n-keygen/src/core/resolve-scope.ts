import * as path from 'node:path';
import type { ScopeConfig } from './types';

export interface ResolvedScope {
  readonly name: string;
  readonly files: ReadonlyMap<string, string>;
}

export function resolveScope(
  workspaceRoot: string,
  scope: ScopeConfig,
  supportedLangs: ReadonlyArray<string>,
): ResolvedScope {
  const pattern = scope.filePattern ?? '{lang}.json';
  const files = new Map<string, string>();

  for (const lang of supportedLangs) {
    const name = scope.name ?? '';
    const relativePath = pattern.replace('{lang}', lang).replace('{name}', name);
    files.set(lang, path.resolve(workspaceRoot, scope.dir, relativePath));
  }

  return { name: scope.name ?? '', files };
}
