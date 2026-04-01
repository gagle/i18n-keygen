# Vue i18next Example

Vue 3 app using i18next-vue. Translations are served as static files from the `public/` directory, following the standard i18next HTTP backend convention.

## Translation structure

```
public/locales/
  en-GB/  core.module.json  products.module.json  orders.module.json
  en/     core.module.json  products.module.json  orders.module.json
```

## Configuration

- **Library:** i18next-vue
- **Languages:** `en-GB` (default), `en`
- **Separator:** `:` (colon) — keys look like `core:appTitle`, `products:table.name`
- **Scopes:** 3 namespaces using `filePattern: "{lang}/core.module.json"`

## How it works

A custom `useI18n` composable wraps i18next-vue's `useTranslation` with the generated `I18nKey` type. Templates use the typed `t()` function:

```vue
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <h1>{{ t('core:appTitle') }}</h1>
</template>
```

## How it differs from React i18next

Same i18next file layout and config. The difference is the framework layer: Vue composable (`useI18n`) instead of React hook. Both use Vite and serve translations from `public/locales/`.

## Run

```bash
npx nx serve vue-i18next-example
```
