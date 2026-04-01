# Angular Conventions

## Core Rules

- DO: **Standalone only** — no NgModules.
- DO: **Zoneless** — `provideZonelessChangeDetection()` in app config.
- DO: **`inject()` over constructor** — `private readonly _service = inject(MyService)`.
- DO: **Signals** — `signal()`, `.set()`, `.update()` for reactive state.
- DO: **Inline templates** — example apps use `template:` for simplicity. Separate files for complex components.
- DO: **Self-closing tags** — `<tag />` for every empty element.
- DO: **No hardcoded text in templates** — all user-facing text uses `i18n` pipe (`{{ 'scope.key' | i18n }}`).
- NEVER: **Expose services to templates** — wrap service calls in component methods or signals.
- NEVER: **Use deprecated APIs** — use `provideAppInitializer()` not `APP_INITIALIZER`.

## i18n Pipe

All Angular example apps use a custom pure `I18nPipe` that wraps the underlying i18n service. Never use `TranslocoPipe` or framework-specific pipes directly in templates.

```ts
@Pipe({ name: 'i18n', standalone: true })
export class I18nPipe implements PipeTransform {
  private readonly _service = inject(TranslocoService);

  public transform(key: I18nKey, params?: Record<string, unknown>): string {
    return this._service.translate(key, params);
  }
}
```

The pipe is pure because translations are pre-loaded via `provideAppInitializer` before any component renders.

## Transloco Setup

- DO: **Custom `TranslocoLoader`** — bundle scope JSONs under their scope keys via dynamic imports.
- DO: **`provideAppInitializer`** — pre-load the default language at startup so pipes can be pure.
- NEVER: **`provideTranslocoScope` in components** — loading belongs in app config, not component providers.

## Member Visibility

| Visibility | Use for |
|------------|---------|
| `protected` | Template-bound fields and methods |
| `public` | API methods (called from outside) |
| `private` | Internal logic and injected dependencies |
