# React Conventions

## Core Rules

- DO: **Functional components only** — no class components.
- DO: **Named exports** — `export function App()`, not `export default`.
- DO: **React 19 JSX transform** — no `import React from 'react'` needed.
- DO: **`createRoot` API** — never `ReactDOM.render`.
- DO: **Hooks for logic extraction** — custom hooks with `use` prefix (`useI18n`).

## i18n Pattern

Use a custom `useI18n` hook that wraps `react-i18next`'s `useTranslation` with the generated `I18nKey` type. Single `t()` function with full-path keys — same pattern as Angular and Vue.

```tsx
const { t } = useI18n();
// ...
{t('core:appTitle')}
{t('products:table.name')}
```

- DO: **Full-path keys** — `t('core:appTitle')`, not namespace-scoped `tCore('appTitle')`.
- NEVER: **Use `useTranslation` directly** — always go through the typed wrapper.

## File Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase `.tsx` | `App.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-i18n.ts` |
| Config/utilities | kebab-case `.ts` | `i18n.ts` |
| Generated files | `.generated.ts` suffix | `i18n-keys.generated.ts` |

## Build

- Vite with `@vitejs/plugin-react`.
- i18next HTTP backend loads translations from `/locales/{lng}/{ns}.module.json`.
