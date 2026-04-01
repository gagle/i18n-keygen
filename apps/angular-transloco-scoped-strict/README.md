# Angular Transloco Scoped Strict Example

Angular app using Transloco with scoped translations and `strictSync: true`. All languages must have identical key structures or the build fails.

## Translation structure

```
i18n/
  core/       en.json  es.json
  products/   en.json  es.json
  orders/     en.json  es.json
```

## Configuration

- **Library:** Transloco
- **Languages:** `en`, `es`
- **Separator:** `.` (dot) -- keys look like `core.appTitle`, `products.table.name`
- **Scopes:** 3 separate directories (core, products, orders)
- **Sync mode:** `strictSync: true` -- all languages must have identical keys

## How it differs from the default mode

With `strictSync: true`, the executor enforces that every language file has the exact same keys as the default language. Missing or orphaned keys are errors and the build fails. The generated type uses the intersection of keys across all languages.

Without `strictSync` (the default), the executor uses the default language as the source of truth. Missing translations in other languages produce warnings but the build passes. Only orphaned keys (keys that exist in a non-default language but not in the default) cause failures.

## How it works

A custom `AppTranslocoLoader` dynamically imports each scope's JSON files and merges them into a flat namespace. Translations are pre-loaded via `provideAppInitializer`, so the `I18nPipe` can be pure (no async).

Templates use the typed `I18nPipe` with full-path keys:

```html
{{ 'core.appTitle' | i18n }}
{{ 'products.table.price' | i18n }}
```

## Run

```bash
npx nx serve angular-transloco-scoped-strict-example
```
