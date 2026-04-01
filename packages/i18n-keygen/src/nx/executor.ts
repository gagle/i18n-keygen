import { generate } from '../core/generate';
import { loadConfig } from '../core/load-config';
import { resolveConfig } from '../core/resolve-config';
import { DEFAULT_CONFIG_FILE } from '../core/types';
import { watchTranslations } from '../core/watch';
import type { GenerateKeysOptions } from './schema';

interface ExecutorContext {
  readonly root: string;
  readonly target?: { readonly continuous?: boolean };
}

export default async function generateKeysExecutor(
  options: GenerateKeysOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const workspaceRoot = context.root;
  const configFile = options.configFile ?? DEFAULT_CONFIG_FILE;
  const config = loadConfig(workspaceRoot, configFile);
  const resolved = resolveConfig(config);
  const continuous = context.target?.continuous ?? false;

  if (continuous) {
    generate(workspaceRoot, resolved);
    await watchTranslations(workspaceRoot, resolved, () => generate(workspaceRoot, resolved));
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise(() => {});
  }

  const success = generate(workspaceRoot, resolved);
  return { success };
}
