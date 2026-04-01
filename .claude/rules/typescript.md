# TypeScript Conventions

- NEVER: **Comments** in any files unless logic is extremely complex. Use semantic names for readability.
- DO: `strict: true` with `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- DO: `Array<T>` not `T[]`.
- DO: **`readonly`** on every class field that is never reassigned.
- DO: **`import type`** for type-only imports. Separate from value imports.
- DO: **Type safety** — avoid bare primitive types where a union or domain type exists. Use `Record<SupportedLang, ...>` not `Record<string, ...>`.
- DO: **Explicit types on external returns** — when a function from an external dependency returns `any`, add an explicit type annotation.
- NEVER: **`any`** — no `any`, `as any`, `as unknown`, `as unknown as T`. Exception: `as unknown as T` is acceptable in i18n wrapper functions at the library boundary, where the external library's types are structurally incompatible with the generated `I18nKey` type.
- NEVER: **`enum`** — use string union types: `type Foo = 'a' | 'b'`.
- DO: **Always `async`/`await`** — never `.then()`/`.catch()` chains. Never ignore a `Promise` — `await` it or return it.
- PREFER: **`null` over `undefined` in return types** — `Type | null` for intentional absence.
- DO: **Readability over cleverness** — no chained reduce, nested ternaries.
- DO: **Early returns first** — handle fast/error/empty cases at the top.
- NEVER: **Inline if + return** — always use braces and separate lines.
- DO: **Only export what has external consumers**.
- DO: **Export input/output types** — when a function is exported, its parameter and return type interfaces must also be exported.
- NEVER: **Backwards-compatibility shims** — no re-exports, aliases, or wrappers when moving/renaming. Update all consumers directly.

## Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Private members | `_camelCase` | `private _count` |
| Public members | `camelCase` | `public getValue()` |
| Exported constants | `UPPER_SNAKE_CASE` | `export const DEFAULT_LANG` |
| Files | `kebab-case.ts` | `flatten-keys.ts` |

No single-letter variables. No cryptic abbreviations. No generic names like `data`, `result`, `item`. Name after what they represent.

```ts
scopes.map((scope) => scope.name)       // not (s) => s.name
routes.find((entry) => entry.path === '') // not (r) => r.path
```

## Formatting

Prettier: single quotes, trailing commas, 100 char width, 2-space indent, LF.
