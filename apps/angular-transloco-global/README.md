# Angular Transloco Global Example

Angular app using Transloco with a single global translation file per language. All scopes live inside one JSON file instead of separate directories.

## Translation structure

```
i18n/
  en.json
  es.json
```

Each file contains all scopes as top-level keys:

```json
{
  "core": { "appTitle": "Test App", ... },
  "products": { "pageTitle": "Products", ... },
  "orders": { "pageTitle": "Orders", ... }
}
```

## Configuration

- **Library:** Transloco
- **Languages:** `en`, `es`
- **Separator:** `.` (dot) — keys look like `core.appTitle`, `products.table.name`
- **Scopes:** 1 scope with empty name (no prefix added, keys come from the nested JSON structure)

## How it differs from the scoped example

The scoped example has one directory per feature with separate files. This example puts everything in a single file per language. The generated `I18nKey` type is the same — the difference is only in how translation files are organized on disk.

## Run

```bash
npx nx serve angular-transloco-global-example
```
