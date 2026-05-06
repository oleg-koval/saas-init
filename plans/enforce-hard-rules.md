# Plan: Enforce Hard Rules — saas-init

## Context

`saas-init` is a CLI scaffolding tool that generates production-ready SaaS projects. It has
two distinct layers that both need rule enforcement:

1. **The CLI itself** (`src/`, `tests/`) — the TypeScript source that powers `saas-init`.
   Has Prettier + a minimal ESLint config (parser only, no plugin rules, no `max-lines`).
   No pre-commit hooks.

2. **The templates it generates** (`templates/`) — the files written into new projects.
   Currently: `templates/base/`, `templates/auth/`, `templates/database/`, etc.
   Generated projects get no ESLint config, no pre-commit hooks, no lint/test gates.

Both layers need changes. Layer 2 is the higher-leverage change: every SaaS project a
developer bootstraps with `saas-init` should start with enforcement baked in.

Source: [oleg-koval/RULES.md §2–§3](https://github.com/oleg-koval/starters/blob/main/RULES.md)

---

## Gaps

### Layer 1 — CLI source

| Rule | Current state | Gap |
|------|--------------|-----|
| §2.2 File length 300-line cap | ESLint config has no `max-lines` | Add `max-lines` rule |
| §2.4 Pre-commit hooks | Not configured | Add `lefthook.yml` |
| ESLint strength | Parser-only; no typescript-eslint plugin rules | Upgrade to typescript-eslint strict |

### Layer 2 — Generated project templates

| Rule | Current state | Gap |
|------|--------------|-----|
| §2.2–§2.4 All rules | Generated project has no ESLint, no hooks | Add template ESLint config + lefthook |
| §3.1 Vertical Slice | No architectural guidance in generated project | Add `AGENTS.md` template referencing RULES.md |

---

## Changes

---

### Layer 1: CLI source

#### 1a. `eslint.config.js` — upgrade to typescript-eslint strict + add `max-lines`

Current config is minimal (parser + two rules). The package already has
`@typescript-eslint/parser` in devDeps. Add the full plugin:

Add to `devDependencies`:
```json
"@typescript-eslint/eslint-plugin": "^8.0.0"
```

Replace `eslint.config.js` contents:

```js
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [...tseslint.configs.recommended],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: false, skipComments: false }],
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
```

> Using `tseslint.config()` helper (already in `@typescript-eslint/eslint-plugin`) for
> proper flat-config support. Stays on `recommended` (not `strictTypeChecked`) to avoid
> requiring a `tsconfig.json` reference for tests. Can be upgraded to strict later.

#### 1b. Create `lefthook.yml`

```yaml
pre-commit:
  parallel: false
  commands:
    typecheck:
      run: pnpm typecheck
    lint:
      run: pnpm lint
    format-check:
      run: pnpm format:check
    test:
      run: pnpm test
```

#### 1c. `package.json` — add lefthook devDep + prepare script

```json
"lefthook": "^1.11.0"
```

```json
"prepare": "lefthook install"
```

---

### Layer 2: Generated project templates

#### 2a. Create `templates/base/eslint.config.mjs`

This file will be copied into every generated project's root:

```js
// @ts-check
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['src/**/*.ts', 'app/**/*.ts', 'app/**/*.tsx', 'components/**/*.tsx'],
    extends: [...tseslint.configs.recommended],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: false, skipComments: false }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**'],
  },
)
```

#### 2b. Create `templates/base/lefthook.yml`

```yaml
pre-commit:
  parallel: false
  commands:
    typecheck:
      run: pnpm typecheck
    lint:
      run: pnpm lint
    format-check:
      run: pnpm format:check
    test:
      run: pnpm test
```

#### 2c. Create `templates/base/AGENTS.md`

Agent instructions for the generated project. Points back to canonical rules:

```markdown
# AGENTS.md

Instructions for AI coding agents working in this project.

## Hard rules

This project was scaffolded by [saas-init](https://github.com/oleg-koval/saas-init)
and obeys the hard rules at:
https://github.com/oleg-koval/starters/blob/main/RULES.md

Key constraints:
- File length: 300 lines hard cap (enforced by ESLint `max-lines`)
- Architecture: Vertical Slice — each feature lives in `features/<name>/`
  (route handler + service + types + tests together)
- E2E tests > unit tests
- No comments except single-line WHY notes
- Pre-commit hooks mandatory — do not bypass with `--no-verify`

## Commands

- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier
- `pnpm test` — run tests
- `pnpm typecheck` — run tsc
- `pnpm dev` — start dev server

## Architecture

Follow Vertical Slice Architecture. Each feature is self-contained:

```
features/
  billing/
    route.ts        ← Next.js route handler
    service.ts      ← business logic
    types.ts        ← DTOs and Zod schemas
    billing.test.ts ← E2E test hitting the route
  auth/
    ...
```

Do not create shared `services/` or `repositories/` layers.
```

#### 2d. Update `templates/base/package.json` — add lint/format scripts + lefthook dep

The base template's `package.json` needs these additions (merge into existing template):

```json
"scripts": {
  "lint": "next lint --dir src --dir app --dir components",
  "lint:fix": "next lint --fix --dir src --dir app --dir components",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "prepare": "lefthook install"
},
"devDependencies": {
  "lefthook": "^1.11.0",
  "@typescript-eslint/eslint-plugin": "^8.0.0",
  "typescript-eslint": "^8.0.0"
}
```

#### 2e. Update generator to write the new template files

In `src/generators/base.ts`, ensure the file-copy logic includes the new template files:
- `eslint.config.mjs`
- `lefthook.yml`
- `AGENTS.md`

These should be included in the base template directory traversal (verify the generator uses
`fs-extra.copy` over the full `templates/base/` tree — if so, no code change is needed beyond
adding the template files). If the generator has an explicit allowlist of files to copy, add
these three.

---

## Files changed

### CLI (Layer 1)

| File | Change |
|------|--------|
| `eslint.config.js` | Upgrade to typescript-eslint recommended + `max-lines: 300` |
| `lefthook.yml` | Create — pre-commit gates (typecheck/lint/format/test) |
| `package.json` | Add `lefthook` devDep + `prepare` script + `@typescript-eslint/eslint-plugin` |
| `AGENTS.md` | Add pre-commit section |

### Templates (Layer 2)

| File | Change |
|------|--------|
| `templates/base/eslint.config.mjs` | Create — max-lines 300, ts-eslint recommended |
| `templates/base/lefthook.yml` | Create — pre-commit gates |
| `templates/base/AGENTS.md` | Create — hard rules pointer + Vertical Slice architecture guidance |
| `templates/base/package.json` | Add lint/format/typecheck/prepare scripts + lefthook/ts-eslint devDeps |
| `src/generators/base.ts` | Verify (or update) that new template files are included in copy |

---

## Verification

### CLI layer

```bash
# 1. Install deps (triggers prepare → lefthook install)
pnpm install

# 2. Verify max-lines fires
node -e "console.log(Array(302).fill('const x = 1;').join('\n'))" > src/toobig.ts
pnpm lint  # should error: max-lines
rm src/toobig.ts

# 3. Make a clean commit
git add -A && git commit -m "test: verify CLI hooks pass"
```

### Template layer

```bash
# 4. Run saas-init to scaffold a test project
node dist/index.js init --name test-project --output /tmp/test-project

# 5. Verify generated project has the new files
ls /tmp/test-project/eslint.config.mjs   # exists
ls /tmp/test-project/lefthook.yml        # exists
ls /tmp/test-project/AGENTS.md           # exists

# 6. Verify generated project's ESLint fires on a long file
node -e "console.log(Array(302).fill('const x = 1;').join('\n'))" \
  > /tmp/test-project/src/toobig.ts
cd /tmp/test-project && pnpm lint        # should error: max-lines
```
