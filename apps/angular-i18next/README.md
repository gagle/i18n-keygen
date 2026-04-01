# Angular i18next Example

Angular app using i18next via `angular-i18next`. Translations follow the i18next convention: language directories containing namespace module files.

## Translation structure

```
locales/
  en-GB/  core.module.json  products.module.json  orders.module.json
  en/     core.module.json  products.module.json  orders.module.json
```

## Configuration

- **Library:** angular-i18next
- **Languages:** `en-GB` (default), `en`
- **Separator:** `:` (colon) — keys look like `core:appTitle`, `products:table.name`
- **Scopes:** 3 namespaces using `filePattern: "{lang}/core.module.json"`

## How it differs from Transloco examples

i18next organizes files by language first, then namespace — the inverse of Transloco's scope-first layout. The `filePattern` with `{lang}` placeholder tells the executor how to find each language's file within the shared `locales/` directory. The colon separator matches i18next's native `namespace:key` convention.

## Run

```bash
npx nx serve angular-i18next-example
```
