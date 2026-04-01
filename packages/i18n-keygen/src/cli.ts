#!/usr/bin/env node

import * as path from 'node:path';
import { cli } from 'cleye';
import { generate } from './core/generate';
import { loadConfig } from './core/load-config';
import { resolveConfig } from './core/resolve-config';
import { DEFAULT_CONFIG_FILE } from './core/types';
import { watchTranslations } from './core/watch';

const pkg = require(path.resolve(__dirname, '../../package.json')) as {
  version: string;
  description: string;
};

const argv = cli({
  name: 'i18n-keygen',
  version: pkg.version,

  flags: {
    config: {
      type: String,
      description: 'Path to config file',
      default: DEFAULT_CONFIG_FILE,
    },
    watch: {
      type: Boolean,
      description: 'Watch for changes and regenerate',
      default: false,
    },
    cwd: {
      type: String,
      description: 'Working directory',
      default: process.cwd(),
    },
  },

  help: {
    description: pkg.description,
  },
});

const i18nConfig = loadConfig(argv.flags.cwd, argv.flags.config);
const resolved = resolveConfig(i18nConfig);
const success = generate(argv.flags.cwd, resolved);

if (argv.flags.watch) {
  void watchTranslations(argv.flags.cwd, resolved, () =>
    generate(argv.flags.cwd, resolved),
  );
} else if (!success) {
  process.exit(1);
}
