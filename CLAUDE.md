# i18n-keygen

## Workflow Orchestration

### 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents

### 3. Self-Improvement Loop

- After ANY correction from the user: update the relevant `.claude/rules/*.md` file
- Write rules for yourself that prevent the same mistake

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes

## What This Is

Universal i18n type generator that reads JSON translation files and generates TypeScript union types. Supports Vite, Webpack, Rollup, esbuild, Rspack, Rolldown, Farm, Nx, and CLI.

## Nx Workspace

- Monorepo: Nx with pnpm workspaces
- Unit tests: Vitest (`restoreMocks: true`)
- E2E: Vitest (runs executor against example apps)

```text
packages/i18n-keygen/      <- publishable package (core + unplugin + Nx executor)
apps/                      <- 5 framework example apps (Angular, React, Vue)
examples/                  <- 8 build tool example apps
e2e/                       <- integration tests
```

## Conventions

All conventions live in `.claude/rules/` and are auto-loaded into context every session.

## Verification

After generating or modifying code, always run:

```bash
pnpm exec nx run i18n-keygen:build
pnpm exec nx run i18n-keygen:test
pnpm exec nx run i18n-keygen:lint
pnpm exec nx run i18n-keygen:typecheck
pnpm exec nx run-many -t i18n
```

## Core Principles

- **Simplicity First**: Make every change as simple as possible.
- **No Laziness**: Find root causes. No temporary fixes.
- **Minimal Impact**: Changes should only touch what's necessary.
- **No Premature Abstractions**: Don't add helpers for one-time operations.
- **Pure Functions**: All logic in `core/` — config passed as params, no module-level state.
- **100% Test Coverage**: Every branch, every error path.
