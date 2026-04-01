import * as fs from 'node:fs';
import * as path from 'node:path';
import { logError } from '../utilities/logger';
import { parseJsonFile } from '../utilities/parse-json';
import { flattenKeys } from './flatten-keys';
import type { ResolvedScope } from './resolve-scope';

export interface SyncError {
  readonly scope: string;
  readonly lang: string;
  readonly missing: ReadonlyArray<string>;
  readonly orphaned: ReadonlyArray<string>;
  readonly filePath: string;
}

export interface ValidationResult {
  readonly errors: ReadonlyArray<SyncError>;
  readonly intersectionKeys: ReadonlyArray<string>;
  readonly hasParseErrors: boolean;
}

export function validateCrossLanguageSync(
  scope: ResolvedScope,
  defaultLang: string,
  workspaceRoot: string,
): ValidationResult {
  const errors: Array<SyncError> = [];
  const keysByLang = new Map<string, ReadonlySet<string>>();

  for (const [lang, filePath] of scope.files) {
    if (!fs.existsSync(filePath)) {
      logError(`✘ Missing file: ${path.relative(workspaceRoot, filePath)}`);
      return {
        errors: [{ scope: scope.name, lang, missing: [], orphaned: [], filePath }],
        intersectionKeys: [],
        hasParseErrors: false,
      };
    }
    const json = parseJsonFile(filePath, workspaceRoot);
    if (!json) {
      return {
        errors: [{ scope: scope.name, lang, missing: [], orphaned: [], filePath }],
        intersectionKeys: [],
        hasParseErrors: true,
      };
    }
    keysByLang.set(lang, new Set(flattenKeys(json, '')));
  }

  const defaultKeys = keysByLang.get(defaultLang)!;

  for (const [lang, langKeys] of keysByLang) {
    if (lang === defaultLang) {
      continue;
    }
    const missing = [...defaultKeys].filter((k) => !langKeys.has(k));
    const orphaned = [...langKeys].filter((k) => !defaultKeys.has(k));

    if (missing.length > 0 || orphaned.length > 0) {
      errors.push({
        scope: scope.name,
        lang,
        missing,
        orphaned,
        filePath: scope.files.get(lang)!,
      });
    }
  }

  if (errors.length === 0) {
    return { errors, intersectionKeys: [], hasParseErrors: false };
  }

  const allKeySets = [...keysByLang.values()];
  const intersection = [...allKeySets[0]!].filter((k) => allKeySets.every((s) => s.has(k)));

  return { errors, intersectionKeys: intersection, hasParseErrors: false };
}
