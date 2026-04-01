import * as path from 'node:path';
import { logWarn } from '../utilities/logger';
import { parseJsonFile } from '../utilities/parse-json';
import type { I18nConfig } from './types';

export function loadConfig(workspaceRoot: string, configFile: string): I18nConfig {
  const absolutePath = path.resolve(workspaceRoot, configFile);
  const json = parseJsonFile(absolutePath, workspaceRoot);

  if (!json) {
    throw new Error(`Failed to read config file: ${configFile}`);
  }

  if (typeof json['outputFile'] !== 'string') {
    throw new Error(`Config file ${configFile} is missing required "outputFile" string`);
  }

  if (!Array.isArray(json['scopes'])) {
    throw new Error(`Config file ${configFile} is missing required "scopes" array`);
  }

  if (!Array.isArray(json['supportedLangs'])) {
    throw new Error(`Config file ${configFile} is missing required "supportedLangs" array`);
  }

  if ('partialTranslations' in json) {
    logWarn(
      '"partialTranslations" is deprecated and ignored. Remove it from your config. ' +
        'The default mode now matches the old partialTranslations behavior. ' +
        'Use "strictSync": true if you need all languages to be fully synced.',
    );
  }

  return {
    outputFile: json['outputFile'] as string,
    scopes: json['scopes'] as I18nConfig['scopes'],
    supportedLangs: json['supportedLangs'] as I18nConfig['supportedLangs'],
    ...(typeof json['defaultLang'] === 'string' ? { defaultLang: json['defaultLang'] } : {}),
    ...(typeof json['scopeSeparator'] === 'string' ? { scopeSeparator: json['scopeSeparator'] } : {}),
    ...(typeof json['strictSync'] === 'boolean' ? { strictSync: json['strictSync'] } : {}),
    ...(typeof json['stampConsumer'] === 'string' ? { stampConsumer: json['stampConsumer'] } : {}),
  };
}
