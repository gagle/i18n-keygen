# Nx Plugin Conventions

## Architecture

```text
packages/i18n-keygen/
├── src/
│   ├── index.ts                    — public API exports
│   ├── core/                       — pure functions (framework-agnostic)
│   │   ├── types.ts                — shared type definitions
│   │   ├── generate.ts             — key generation logic
│   │   ├── load-config.ts          — config file loading
│   │   ├── resolve-config.ts       — config defaults resolution
│   │   ├── resolve-scope.ts        — scope file resolution
│   │   ├── validate-sync.ts        — cross-language sync validation
│   │   ├── write-output.ts         — generated file writing
│   │   ├── watch.ts                — file system watcher
│   │   └── flatten-keys.ts         — JSON key flattening
│   ├── unplugin.ts                 — createUnplugin factory
│   ├── vite.ts, webpack.ts, ...    — per-tool entry points
│   ├── cli.ts                      — CLI entry point
│   ├── nx/                         — Nx executor (thin wrapper)
│   │   ├── executor.ts
│   │   ├── schema.json
│   │   └── schema.d.ts
│   └── utilities/                  — shared helpers (logger, JSON parsing)
├── executors.json
├── package.json
└── project.json
```

## Rules

- Executors return `Promise<{ success: boolean }>`.
- Pure functions in `core/` — all config passed as params, no module-level state.
- `executors.json` `implementation` points to compiled JS in `dist/`.
- `schema.json` validates options at runtime.
- `schema.d.ts` provides compile-time types.

## Example Apps

5 framework apps in `apps/` covering Angular (Transloco, i18next), React, and Vue.
8 build tool examples in `examples/` covering Vite, Webpack, Rollup, esbuild, Rspack, Rolldown, Farm, and CLI.
All paths in `project.json` are relative to workspace root.

## Adding a New Executor

1. Add core logic in `src/core/`.
2. Create `src/nx/<name>/executor.ts`, `schema.json`, `schema.d.ts` as a thin wrapper.
3. Register in `executors.json`.
4. Add e2e test in `e2e/`.
