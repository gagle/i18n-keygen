<h1 align="center">i18n-keygen</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/i18n-keygen"><img src="https://img.shields.io/npm/v/i18n-keygen.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/i18n-keygen"><img src="https://img.shields.io/npm/dm/i18n-keygen.svg" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/i18n-keygen.svg" alt="license" /></a>
</p>

<p align="center"><strong>Type-safe i18n keys for every build tool. One package, zero lock-in.</strong></p>

You have translation JSON files. You use `t('products.pageTitle')` in your templates. One day someone renames that key in the JSON and nothing breaks until a user sees a raw key string in production.

Platforms like Lokalise and Crowdin manage your translations, but nothing catches broken keys at compile time. `i18n-keygen` bridges that gap. It reads your translation JSON files and generates a TypeScript union type with every valid key. Your IDE autocompletes them, your compiler catches typos, and your CI fails before broken translations reach users.

```typescript
// generated automatically from your JSON files
export type I18nKey =
  | 'core.appTitle'
  | 'core.nav.home'
  | 'core.nav.products'
  | 'products.pageTitle'
  | 'products.table.name'
  | 'products.table.price'
  | 'orders.status.pending'
  | 'orders.status.shipped';
```

## Works with

**Transloco**, **i18next**, **ngx-translate**, **react-i18next**, **i18next-vue**, or any library that takes a string key. It doesn't care about your framework. It reads JSON, writes TypeScript.

Build tool integrations are powered by [unplugin](https://unplugin.unjs.io/).

## Install

```bash
npm install i18n-keygen --save-dev
```

## Quick Start

All you need is a minimal config file and one line in your build tool.

Create an `i18n.config.json` at your project root:

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "supportedLangs": ["en", "es"],
  "scopes": [{ "dir": "i18n" }]
}
```

Then wire it into your build tool (see [Configuration](#configuration) for all options):

<details>
<summary>Vite</summary>

```ts
// vite.config.ts
import i18nKeygen from 'i18n-keygen/vite';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>Webpack</summary>

```js
// webpack.config.mjs
import i18nKeygen from 'i18n-keygen/webpack';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>Rollup</summary>

```js
// rollup.config.mjs
import i18nKeygen from 'i18n-keygen/rollup';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>esbuild</summary>

```js
// build.mjs
import esbuild from 'esbuild';
import i18nKeygen from 'i18n-keygen/esbuild';

await esbuild.build({
  plugins: [
    i18nKeygen(),
  ],
});
```
</details>

<details>
<summary>Rspack</summary>

```js
// rspack.config.mjs
import i18nKeygen from 'i18n-keygen/rspack';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>Rolldown</summary>

```js
// rolldown.config.mjs
import i18nKeygen from 'i18n-keygen/rolldown';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>Farm</summary>

```ts
// farm.config.ts
import i18nKeygen from 'i18n-keygen/farm';

export default {
  plugins: [
    i18nKeygen(),
  ],
};
```
</details>

<details>
<summary>Nx</summary>

```json
{
  "targets": {
    "i18n": {
      "executor": "i18n-keygen:keys",
      "cache": true
    },
    "i18n-watch": {
      "executor": "i18n-keygen:keys",
      "continuous": true
    },
    "build": { "dependsOn": ["i18n"] },
    "serve": { "dependsOn": ["i18n-watch"], "continuous": true }
  }
}
```

The executor accepts an optional `configFile` option (defaults to `i18n.config.json`):

```json
{
  "i18n": {
    "executor": "i18n-keygen:keys",
    "options": { "configFile": "config/i18n-custom.json" }
  }
}
```

For Nx remote caching, add explicit `inputs` and `outputs` to the `i18n` target:

```json
{
  "i18n": {
    "executor": "i18n-keygen:keys",
    "inputs": ["{projectRoot}/i18n.config.json", "{projectRoot}/i18n/**/*.json"],
    "outputs": ["{projectRoot}/src/i18n/i18n-keys.generated.ts"],
    "cache": true
  }
}
```
</details>

<details>
<summary>CLI</summary>

```bash
npx i18n-keygen
npx i18n-keygen --watch
```
</details>

## Configuration

Create an `i18n.config.json` file:

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "supportedLangs": ["en", "es"],
  "defaultLang": "en",
  "scopes": [
    { "name": "core", "dir": "i18n/core" },
    { "name": "products", "dir": "i18n/products" },
    { "name": "orders", "dir": "i18n/orders" }
  ]
}
```

Each scope points to a directory with one JSON file per language (`en.json`, `es.json`). The scope `name` becomes the key prefix in the generated type.

| Field | Type | Default | Description |
|---|---|---|---|
| `outputFile` | `string` | required | Path to the generated `.ts` file |
| `scopes` | `array` | required | Translation scopes (see below) |
| `supportedLangs` | `string[]` | required | Language codes to validate |
| `defaultLang` | `string` | `"en"` | Reference language for key structure |
| `scopeSeparator` | `string` | `"."` | Character between scope name and key |
| `strictSync` | `boolean` | `false` | When `true`, all languages must have identical keys or the build fails |

Each scope has:

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | none | Key prefix added before each key (e.g. `core.appTitle`). Omit for no prefix |
| `dir` | `string` | required | Directory containing translation files |
| `filePattern` | `string` | `"{lang}.json"` | File name template. Supports `{lang}` and `{name}` placeholders |

## How it works with your translation platform

If you use Lokalise, Crowdin, Phrase, or any other translation management system, you already know the workflow: developers add keys to the default language, translators fill in other languages later. The default language is the source of truth.

`i18n-keygen` matches this workflow out of the box:

- **Add a key to English** and use it in your code immediately. The type is generated from your default language, so the key is available the moment you save the JSON.
- **Other languages can lag behind.** Missing translations in non-default languages produce warnings, not errors. Your build passes, your dev server keeps running.
- **Orphaned keys are caught.** If a non-default language has a key that doesn't exist in the default language, that's an error. It means a translation is stale and should be removed.

```
[I18n] Found 3 scopes: core, orders, products
[I18n] core — es missing 1 keys
[I18n]   footer.copyright
[I18n] orders (en, es synced)
[I18n] products (en, es synced)
[I18n] Generated 18 keys -> src/i18n/i18n-keys.generated.ts
```

The build succeeds. The type includes `footer.copyright`. Your IDE autocompletes it. The translator adds the Spanish version when they get to it.

### Strict sync mode

For teams that need all translations complete before shipping, add `"strictSync": true` to your config:

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "supportedLangs": ["en", "es"],
  "strictSync": true,
  "scopes": [{ "name": "core", "dir": "i18n/core" }]
}
```

With strict sync:

- All languages must have identical key structures or the build fails
- Missing and orphaned keys are both treated as errors
- A failing scope emits **zero keys** — every `t()` call using that scope's keys becomes a TypeScript error
- Synced scopes are unaffected and still emit their keys normally

```
[I18n] core — missing in es: footer.copyright
[I18n]   Add to: i18n/core/es.json
```

#### Where errors surface

| Layer | Catches errors? | What happens |
|-------|:---:|---|
| 🖥️ **Terminal** (`nx serve` / `npx i18n-keygen --watch`) | ✅ | Prints `✘ scope — missing/orphaned` errors. The type is regenerated with zero keys for failing scopes. |
| 📝 **IDE** (VS Code, WebStorm) | ✅ | Language Service shows type errors on every `t()` / pipe call using the failing scope's keys. |
| 🏗️ **CI** (`nx build` / `npx i18n-keygen`) | ✅ | The `i18n` target exits with failure **before** compilation starts. The build pipeline stops. |
| 🌐 **Dev server** (browser reload) | ✅ | `I18N_KEYS_STAMP` forces Angular's incremental builder to re-check templates when keys change. Terminal (`i18n-keygen --watch`) shows sync errors inline. |

> **💡 Why does each consumer file have an `I18N_KEYS_STAMP` export?**
>
> Angular's dev server caches template diagnostics in a `WeakMap` keyed by `SourceFile` object identity. When a file's content doesn't change on disk, the same `SourceFile` is reused and stale diagnostics are served — even if the imported `I18nKey` type resolved to something different. `I18N_KEYS_STAMP` is a const with a literal hash that i18n-keygen updates at the end of each consumer file. The changed content forces TypeScript to create a new `SourceFile`, busting Angular's diagnostic cache and triggering fresh template type-checking.
>
> `I18N_KEYS_STAMP` is auto-managed by i18n-keygen — you don't need to edit it. Use `"stampConsumer": "i18n.pipe.ts"` in your config to limit stamping to a single consumer file (auto-detected by default).

Use this when you want to guarantee complete translations before merging.

## Recipes

### Transloco with scoped translations

One directory per scope, one JSON per language inside each:

```
i18n/
  core/     en.json  es.json
  products/ en.json  es.json
  orders/   en.json  es.json
```

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "supportedLangs": ["en", "es"],
  "scopes": [
    { "name": "core", "dir": "i18n/core" },
    { "name": "products", "dir": "i18n/products" },
    { "name": "orders", "dir": "i18n/orders" }
  ]
}
```

Generates keys like `core.appTitle`, `products.table.name`, `orders.status.pending`.

### Transloco with a single global file

All translations in one file per language. No scope directories, no scope prefix — keys come directly from the JSON structure:

```
i18n/
  en.json
  es.json
```

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "supportedLangs": ["en", "es"],
  "scopes": [{ "dir": "i18n" }]
}
```

If your `en.json` contains `{ "greeting": "Hello", "nav": { "home": "Home" } }`, this generates keys like `greeting`, `nav.home`. If your JSON has top-level namespaces like `{ "core": { "appTitle": "..." } }`, those become part of the key: `core.appTitle`.

### i18next with namespace files

i18next organizes files by language first, then namespace:

```
locales/
  en-GB/  core.module.json  products.module.json
  en/     core.module.json  products.module.json
```

```json
{
  "outputFile": "src/i18n/i18n-keys.generated.ts",
  "scopeSeparator": ":",
  "supportedLangs": ["en-GB", "en"],
  "defaultLang": "en-GB",
  "scopes": [
    { "name": "core", "dir": "locales", "filePattern": "{lang}/core.module.json" },
    { "name": "products", "dir": "locales", "filePattern": "{lang}/products.module.json" },
    { "name": "orders", "dir": "locales", "filePattern": "{lang}/orders.module.json" }
  ]
}
```

Generates keys like `core:appTitle`, `products:table.name`, `orders:status.pending`.

The `filePattern` with `{lang}` placeholder handles i18next's `{language}/{namespace}.json` convention. This same config works for React (`react-i18next`), Vue (`i18next-vue`), and Angular (`angular-i18next`).

## Using the generated type

The generated file exports a union type and a fingerprint value:

```typescript
export type I18nKey =
  | 'core.appTitle'
  | 'core.nav.home'
  | 'products.pageTitle'
  | 'orders.status.pending';

```

Wrap your i18n library's translate function with `I18nKey`. i18n-keygen automatically adds an `I18N_KEYS_STAMP` export at the end of each consumer file to force the dev server to detect type changes (see [Where errors surface](#where-errors-surface)).

### Angular (Transloco)

```typescript
import type { I18nKey } from './i18n-keys.generated';

@Pipe({ name: 'i18n', standalone: true })
export class I18nPipe implements PipeTransform {
  private readonly _service = inject(TranslocoService);

  public transform(key: I18nKey, params?: Record<string, unknown>): string {
    return this._service.translate(key, params);
  }
}
```

```html
<h1>{{ 'core.appTitle' | i18n }}</h1>
<td>{{ 'products.table.price' | i18n }}</td>
```

### React (react-i18next)

```typescript
import type { I18nKey } from './i18n-keys.generated';

type TypedTFunction = (key: I18nKey, params?: Record<string, unknown>) => string;

export function useI18n(): { t: TypedTFunction } {
  const { t } = useTranslation();
  return { t: t as unknown as TypedTFunction };
}
```

```tsx
const { t } = useI18n();
return <h1>{t('core:appTitle')}</h1>;
```

### Vue (i18next-vue)

```typescript
import type { I18nKey } from './i18n-keys.generated';

type TypedTFunction = (key: I18nKey, params?: Record<string, unknown>) => string;

export function useI18n(): { t: TypedTFunction } {
  const { t } = useTranslation();
  return { t: t as unknown as TypedTFunction };
}
```

```vue
<template>
  <h1>{{ t('core:appTitle') }}</h1>
</template>
```

The wrapper is 5-10 lines in every framework. The `as unknown as` cast at the library boundary is the only place you bypass strict types, and it's intentional: the external library's signature is `(key: string) => string`, but you know the keys are constrained.

## Watch mode

For **Vite, Webpack, Rollup**, and other build tools, watch mode works automatically through the dev server -- the plugin detects file changes and regenerates the type.

For **CLI** users, pass the `--watch` flag:

```bash
npx i18n-keygen --watch
```

For **Nx** users, you need two targets because Nx treats one-shot and long-running tasks differently:

| | `i18n` | `i18n-watch` |
|---|---|---|
| Purpose | Build, CI, typecheck | Development |
| Behavior | Runs once, exits | Watches files, regenerates on change |
| Cacheable | Yes | No (long-running) |
| `continuous` | No | Yes |

Wire them with `dependsOn` so they run automatically:

```json
{
  "i18n-watch": {
    "executor": "i18n-keygen:keys",
    "continuous": true
  },
  "build":  { "dependsOn": ["i18n"] },
  "serve":  { "dependsOn": ["i18n-watch"], "continuous": true }
}
```

## Example apps

The repo includes runnable example apps covering every combination of framework and i18n library:

| App | Framework | i18n Library | Separator | Mode |
|---|---|---|---|---|
| `angular-transloco-scoped-strict` | Angular | Transloco | `.` | `strictSync: true` |
| `angular-transloco-global` | Angular | Transloco | `.` | default |
| `angular-i18next` | Angular | angular-i18next | `:` | default |
| `react-i18next` | React | react-i18next | `:` | default |
| `vue-i18next` | Vue | i18next-vue | `:` | default |

Build tool integration examples:

| Example | Build Tool |
|---|---|
| `examples/vite` | Vite |
| `examples/webpack` | Webpack |
| `examples/rollup` | Rollup |
| `examples/esbuild` | esbuild |
| `examples/rspack` | Rspack |
| `examples/rolldown` | Rolldown |
| `examples/farm` | Farm |
| `examples/cli` | CLI |

