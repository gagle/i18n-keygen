import * as path from 'node:path';
import watcher from '@parcel/watcher';
import pc from 'picocolors';
import { debounce } from '../utilities/debounce';
import { log, logError } from '../utilities/logger';
import { resolveScope } from './resolve-scope';
import type { ResolvedConfig } from './types';

const DEBOUNCE_MS = 100;

export async function watchTranslations(
  workspaceRoot: string,
  config: ResolvedConfig,
  onChange: () => void,
): Promise<void> {
  const resolvedScopes = config.scopes.map((scope) =>
    resolveScope(workspaceRoot, scope, config.supportedLangs),
  );

  const dirToScope = new Map<string, string>();
  for (const resolved of resolvedScopes) {
    for (const filePath of resolved.files.values()) {
      dirToScope.set(path.dirname(filePath), resolved.name);
    }
  }

  log(`Watching ${pc.bold(String(resolvedScopes.length))} scopes for changes...`);

  const debouncedOnChange = debounce(() => {
    try {
      onChange();
    } catch (err) {
      logError(`Generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, DEBOUNCE_MS);

  for (const dir of dirToScope.keys()) {
    await watcher.subscribe(dir, (err, events) => {
      if (err) {
        logError(`Watcher error: ${err.message}`);
        return;
      }
      const hasJsonChanges = events.some((event) => event.path.endsWith('.json'));
      if (!hasJsonChanges) {
        return;
      }
      const scopeName = dirToScope.get(dir) || '(root)';
      log(pc.cyan(`Change detected: ${scopeName}`));
      debouncedOnChange();
    });
  }
}
