import * as path from 'node:path';
import { createUnplugin } from 'unplugin';
import { generate } from './core/generate';
import { loadConfig } from './core/load-config';
import { resolveConfig } from './core/resolve-config';
import { resolveScope } from './core/resolve-scope';
import { DEFAULT_CONFIG_FILE } from './core/types';
import { debounce } from './utilities/debounce';

export interface I18nKeygenOptions {
  readonly config?: string;
  readonly cwd?: string;
}

const DEBOUNCE_MS = 100;

export const unplugin = createUnplugin<I18nKeygenOptions | undefined>((options) => {
  const cwd = options?.cwd ?? process.cwd();
  const configPath = options?.config ?? DEFAULT_CONFIG_FILE;

  const debouncedGenerate = debounce(() => {
    const config = loadConfig(cwd, configPath);
    const resolved = resolveConfig(config);
    generate(cwd, resolved);
  }, DEBOUNCE_MS);

  return {
    name: 'i18n-keygen',

    buildStart() {
      const config = loadConfig(cwd, configPath);
      const resolved = resolveConfig(config);
      generate(cwd, resolved);

      const resolvedScopes = resolved.scopes.map((scope) =>
        resolveScope(cwd, scope, resolved.supportedLangs),
      );
      for (const scope of resolvedScopes) {
        for (const filePath of scope.files.values()) {
          this.addWatchFile(filePath);
        }
      }
    },

    watchChange(id: string) {
      if (path.extname(id) === '.json') {
        debouncedGenerate();
      }
    },
  };
});
