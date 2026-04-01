export const DEFAULT_CONFIG_FILE = 'i18n.config.json';

export interface ScopeConfig {
  readonly name?: string;
  readonly dir: string;
  readonly filePattern?: string;
}

export interface I18nConfig {
  readonly outputFile: string;
  readonly scopes: ReadonlyArray<ScopeConfig>;
  readonly supportedLangs: ReadonlyArray<string>;
  readonly defaultLang?: string;
  readonly scopeSeparator?: string;
  readonly strictSync?: boolean;
  readonly stampConsumer?: string;
}

export interface ResolvedConfig {
  readonly outputFile: string;
  readonly scopes: ReadonlyArray<ScopeConfig>;
  readonly supportedLangs: ReadonlyArray<string>;
  readonly defaultLang: string;
  readonly scopeSeparator: string;
  readonly strictSync: boolean;
  readonly stampConsumer?: string;
}
