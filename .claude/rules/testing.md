# Testing Conventions

- Framework: Vitest.
- Coverage: **100%** on all metrics (lines, functions, branches, statements).
- Specs co-located: `.spec.ts` next to `.ts`.
- `vi.fn()` for mocks. `restoreMocks: true` in vitest config.

## Rules

- No redundant "should create" tests.
- Nested describes group tests by state or scenario.
- Each describe that changes state has its own beforeEach.
- "it" blocks contain ONLY expectations.
- Use `vi.spyOn` over `vi.mock`. Only use `vi.mock` when `vi.spyOn` can't reach.
- One logical assertion per "it". Related expects on the same subject are OK.
- No comments in spec files.
- No conditional logic (if/switch) in spec files.

## Spec Structure

```
1. Imports
2. describe('FunctionName', () => {
3.   Nested describes
4. })
```

## Mock Pattern

```typescript
vi.spyOn(fs, 'readFileSync').mockReturnValue('{"key": "value"}');
vi.spyOn(console, 'log').mockImplementation(() => {});
```

## Verification

```bash
npx nx run i18n-keygen:test
npx nx run i18n-keygen:lint
npx nx run i18n-keygen:typecheck
```
