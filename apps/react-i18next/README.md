# React i18next Example

React app using react-i18next. Translations are served as static files from the `public/` directory, following the standard i18next HTTP backend convention.

## Translation structure

```
public/locales/
  en-GB/  core.module.json  products.module.json  orders.module.json
  en/     core.module.json  products.module.json  orders.module.json
```

## Configuration

- **Library:** react-i18next
- **Languages:** `en-GB` (default), `en`
- **Separator:** `:` (colon) — keys look like `core:appTitle`, `products:table.name`
- **Scopes:** 3 namespaces using `filePattern: "{lang}/core.module.json"`

## How it works

A custom `useI18n` hook wraps react-i18next's `useTranslation` with the generated `I18nKey` type. Components use the typed `t()` function:

```tsx
const { t } = useI18n();
return <h1>{t('core:appTitle')}</h1>;
```

## How it differs from Angular i18next

Same i18next file layout and config. The difference is the framework layer: React hook (`useI18n`) instead of Angular pipe. Translations live in `public/locales/` so Vite serves them as static assets.

## Run

```bash
npx nx serve react-i18next-example
```
