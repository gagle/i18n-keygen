# Vue Conventions

## Core Rules

- DO: **Vue 3 Composition API** — always `<script setup lang="ts">`.
- DO: **No Options API** — never use `data()`, `methods`, `computed` properties.
- DO: **Single File Components** — `.vue` extension for all components.
- DO: **TypeScript** — `lang="ts"` on all `<script>` blocks.

## i18n Pattern

Use a custom `useI18n` composable that wraps `i18next-vue`'s `useTranslation` with the generated `I18nKey` type.

```vue
<script setup lang="ts">
import { useI18n } from './i18n/use-i18n';
const { t } = useI18n();
</script>

<template>
  <h2>{{ t('core:appTitle') }}</h2>
</template>
```

- DO: **Namespace-qualified keys** — `'core:appTitle'`, `'products:table.name'`.
- NEVER: **Use `useTranslation` directly** — always go through the typed wrapper.

## File Naming

| Target | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase `.vue` | `App.vue` |
| Composables | kebab-case with `use-` prefix | `use-i18n.ts` |
| Config/utilities | kebab-case `.ts` | `i18n.ts` |
| Generated files | `.generated.ts` suffix | `i18n-keys.generated.ts` |

## Build

- Vite with `@vitejs/plugin-vue`.
- i18next HTTP backend loads translations from `/locales/{lng}/{ns}.module.json`.
