import type { I18nConfig, ResolvedConfig } from './types';

export function resolveConfig(config: I18nConfig): ResolvedConfig {
  return {
    ...config,
    defaultLang: config.defaultLang ?? 'en',
    scopeSeparator: config.scopeSeparator ?? '.',
    strictSync: config.strictSync ?? false,
  };
}
