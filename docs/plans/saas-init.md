# saas-init — Architecture Plan

## Decision Log

### CLI Framework
- **commander** — command definition, argument parsing, help text
- **@clack/prompts** — interactive prompts (consistent with AGENTS.md)
- **tsup** — build (zero-config, fast, outputs CJS + ESM)
- **vitest** — tests (TypeScript-native, no config overhead)
- **fs-extra** — file operations (drop-in fs replacement with mkdirp, copy, etc.)
- **zod** — `ProjectConfig` validation between prompts and generators

No templating libs. `{{variable}}` replacement via a small utility function.

---

## Repository Layout

```
src/
  index.ts                  # entry: commander setup, registers commands
  types.ts                  # ProjectConfig, stack option enums
  commands/
    init.ts                 # `saas-init init` — orchestrates prompts → generators
  prompts/
    project.ts              # name, output directory
    auth.ts                 # auth provider selection
    database.ts             # database selection
    payments.ts             # payments selection (skippable)
    email.ts                # email selection (skippable)
    summary.ts              # display config, confirm or abort
  generators/
    index.ts                # orchestrator: calls each generator in order
    base.ts                 # Next.js base scaffold (layout, tsconfig, package.json)
    auth/
      clerk.ts
      nextauth.ts
      supabase-auth.ts
    database/
      postgres.ts
      sqlite.ts
      supabase-db.ts
    payments/
      stripe.ts
      lemonsqueezy.ts
    email/
      resend.ts
      postmark.ts
  utils/
    template.ts             # replaceVars(src, vars): string
    files.ts                # writeTemplate, copyDir, ensureDir, appendEnv
    deps.ts                 # mergeDeps(base, additions): package.json deps object

templates/
  base/                     # Next.js app scaffold (layout.tsx, tsconfig, etc.)
  auth/
    clerk/
    nextauth/
    supabase/
  database/
    postgres/
    sqlite/
    supabase/
  payments/
    stripe/
    lemonsqueezy/
  email/
    resend/
    postmark/

tests/
  generators/
  utils/
  prompts/
```

---

## Prompt Flow

```
saas-init init

1. Project name        (text input, validated: no spaces, valid npm name)
2. Output directory    (text input, default: ./<project-name>)
3. Auth provider       (select: Clerk | NextAuth | Supabase Auth)
4. Database            (select: Postgres | SQLite | Supabase)
5. Payments            (select: Stripe | Lemon Squeezy | None)
6. Email               (select: Resend | Postmark | None)
7. Summary             (display full config, confirm Y/n)
→  Generate files
→  Install dependencies? (confirm Y/n)
→  Done — show next steps
```

Each prompt step returns a partial `ProjectConfig`. Steps are sequential and non-branching. No step modifies a previous answer.

---

## ProjectConfig Type

```ts
type ProjectConfig = {
  name: string
  outDir: string
  auth: 'clerk' | 'nextauth' | 'supabase'
  database: 'postgres' | 'sqlite' | 'supabase'
  payments: 'stripe' | 'lemonsqueezy' | null
  email: 'resend' | 'postmark' | null
}
```

---

## Generator Contract

Each generator module exports a single function:

```ts
export async function generate(config: ProjectConfig, outDir: string): Promise<void>
```

The orchestrator (`generators/index.ts`) calls them in order:
1. `base` — always runs
2. `auth/<provider>`
3. `database/<provider>`
4. `payments/<provider>` — skipped if null
5. `email/<provider>` — skipped if null

Each generator reads from `templates/` and writes to `outDir`. No generator reaches into another generator's domain.

---

## Template System

Templates are plain files. Variable placeholders use `{{key}}` syntax.

`utils/template.ts` exposes:
```ts
replaceVars(content: string, vars: Record<string, string>): string
```

`utils/files.ts` exposes:
```ts
writeTemplate(templatePath: string, destPath: string, vars: Record<string, string>): Promise<void>
copyDir(src: string, dest: string): Promise<void>
ensureDir(path: string): Promise<void>
appendEnv(destPath: string, vars: Record<string, string>): Promise<void>
```

`appendEnv` appends `KEY=value` lines to `.env.example`, creating the file if absent. All generators that add env vars use this — no generator directly writes `.env.example`.

Templates that need no substitution are copied verbatim. No eval, no runtime imports.

---

## Tasks

Each task is atomic, scoped to 1–3 files, and has explicit success criteria.
Template tasks and generator tasks are split: templates first (static files), then generator source (depends on templates).

---

### TASK-001 — Project scaffold + build setup
**Files:** `package.json`, `tsconfig.json`, `tsup.config.ts`, `eslint.config.js`, `.prettierrc`

Set up the Node.js/TypeScript project with pnpm, tsup build, vitest, ESLint, Prettier. Entry point `src/index.ts` declared as the CLI bin in `package.json`.

**Success:** `pnpm build` produces `dist/index.js`. `node dist/index.js --version` exits 0. `pnpm lint` and `pnpm format --check` exit 0 on an empty `src/`.

- [x] Complete TASK-001

---

### TASK-002 — Types and ProjectConfig schema
**Files:** `src/types.ts`, `tests/types.test.ts`

Define `ProjectConfig` type and all stack option string unions. Export zod schema `projectConfigSchema`.

**Success:** Tests pass. Schema accepts a valid complete config. Schema rejects an unknown auth value, a null database, and a missing `name` field.

- [x] Complete TASK-002

---

### TASK-003 — CLI entry point and init command stub
**Files:** `src/index.ts`, `src/commands/init.ts`

Register `init` command via commander. Stub body calls `console.log('todo')`.

**Success:** `node dist/index.js init` prints `todo` and exits 0. `node dist/index.js --help` lists the `init` command.

- [x] Complete TASK-003

---

### TASK-004 — Template utility
**Files:** `src/utils/template.ts`, `tests/utils/template.test.ts`

Implement `replaceVars(content, vars)`. Missing keys leave the placeholder intact (no throw).

**Success:** Tests cover: single replacement, multiple replacements, missing key (placeholder preserved), adjacent `{{}}` tokens, empty vars object.

- [x] Complete TASK-004

---

### TASK-005 — File utilities
**Files:** `src/utils/files.ts`, `tests/utils/files.test.ts`

Implement `writeTemplate`, `copyDir`, `ensureDir`, `appendEnv` using `fs-extra`. `writeTemplate` reads a template, calls `replaceVars`, writes to dest. `appendEnv` appends `KEY=value` lines to `.env.example`, creating it if absent.

**Success:** Tests write to a temp directory. Assert: `writeTemplate` produces correct substituted content; `appendEnv` creates the file on first call and appends (not overwrites) on subsequent calls; `copyDir` reproduces directory structure.

- [x] Complete TASK-005

---

### TASK-006 — Dependency merge utility
**Files:** `src/utils/deps.ts`, `tests/utils/deps.test.ts`

Implement `mergeDeps(base, additions)` — merges two dependency maps, additions win on conflict. Does not mutate inputs.

**Success:** Tests cover: standard merge, conflict (addition wins), empty base, empty additions, both empty.

- [x] Complete TASK-006

---

### TASK-007 — Prompt: project name + output directory
**Files:** `src/prompts/project.ts`

Use `@clack/prompts`. Validate project name (npm-valid: lowercase, no spaces, no special chars except `-`). Default output dir to `./<name>`.

**Success:** Returns `{ name, outDir }` for valid input. Validation rejects `"My App"`, `"my_app"`, `""`. When `isCancel()` returns true, function calls `process.exit(0)` — verified by mocking `process.exit`.

- [x] Complete TASK-007

---

### TASK-008 — Prompt: auth provider
**Files:** `src/prompts/auth.ts`

Single-select: Clerk / NextAuth / Supabase Auth. Returns `{ auth: AuthProvider }`.

**Success:** Each of the three selections maps to the correct union value (`'clerk'`, `'nextauth'`, `'supabase'`). Cancellation calls `process.exit(0)`.

- [x] Complete TASK-008

---

### TASK-009 — Prompt: database
**Files:** `src/prompts/database.ts`

Single-select: Postgres / SQLite / Supabase. Returns `{ database: DatabaseProvider }`.

**Success:** Each selection maps correctly. Cancellation calls `process.exit(0)`.

- [x] Complete TASK-009

---

### TASK-010 — Prompt: payments
**Files:** `src/prompts/payments.ts`

Single-select: Stripe / Lemon Squeezy / Skip. Returns `{ payments: PaymentsProvider | null }`.

**Success:** Skip returns `null`. Other selections map to `'stripe'` and `'lemonsqueezy'`. Cancellation calls `process.exit(0)`.

- [x] Complete TASK-010

---

### TASK-011 — Prompt: email
**Files:** `src/prompts/email.ts`

Single-select: Resend / Postmark / Skip. Returns `{ email: EmailProvider | null }`.

**Success:** Skip returns `null`. Cancellation calls `process.exit(0)`.

- [x] Complete TASK-011

---

### TASK-012 — Prompt: summary + confirm
**Files:** `src/prompts/summary.ts`

Display all `ProjectConfig` fields. Confirm Y/n. On N or cancel, print abort message and call `process.exit(0)`.

**Success:** Given a complete config, all 6 fields are present in the rendered output. On cancel/N, `process.exit(0)` is called — verified by mocking. Does not call any generator directly (generator call is the caller's responsibility).

- [x] Complete TASK-012

---

### TASK-013 — Base templates
**Files:** `templates/base/app/layout.tsx`, `templates/base/app/page.tsx`, `templates/base/next.config.ts`

Static Next.js app router base files. `layout.tsx` uses `{{name}}` as the metadata title. No logic, plain files.

**Success:** Files exist and are valid UTF-8. `layout.tsx` contains `{{name}}` placeholder. `next.config.ts` is a valid ES module export.

- [x] Complete TASK-013

---

### TASK-014 — Base templates: config files
**Files:** `templates/base/tsconfig.json`, `templates/base/package.json`, `templates/base/.gitignore`

`package.json` uses `{{name}}` as the project name. `tsconfig.json` is strict-mode Next.js config. `.gitignore` covers `node_modules`, `.next`, `.env.local`.

**Success:** Files exist. `package.json` contains `{{name}}`. `tsconfig.json` has `"strict": true`.

- [x] Complete TASK-014

---

### TASK-015 — Base generator
**Files:** `src/generators/base.ts`, `tests/generators/base.test.ts`

Reads from `templates/base/`. Writes all 6 base files to `outDir`. Calls `mergeDeps` to set base Next.js deps in `package.json`.

**Success:** Given a config with `name: 'my-app'`, output directory contains `app/layout.tsx`, `app/page.tsx`, `next.config.ts`, `tsconfig.json`, `package.json`, `.gitignore`. Generated `package.json` has `"name": "my-app"` and includes `next` as a dependency.

- [x] Complete TASK-015

---

### TASK-016 — Auth templates: Clerk
**Files:** `templates/auth/clerk/middleware.ts`, `templates/auth/clerk/app/sign-in/page.tsx`, `templates/auth/clerk/app/sign-up/page.tsx`

Clerk middleware wraps the app. Sign-in and sign-up use `[[...sign-in]]` / `[[...sign-up]]` catch-all routes. Plain template files, no `{{}}` variables needed.

**Success:** Files exist and are valid UTF-8. Middleware exports a default `clerkMiddleware()` call. Sign-in page exports a default component rendering `<SignIn />`.

- [x] Complete TASK-016

---

### TASK-017 — Auth generator: Clerk
**Files:** `src/generators/auth/clerk.ts`, `tests/generators/auth/clerk.test.ts`

Copies 3 Clerk templates to `outDir`. Merges `@clerk/nextjs` into `package.json` via `mergeDeps`. Calls `appendEnv` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

**Success:** Output contains `middleware.ts`, `app/sign-in/page.tsx`, `app/sign-up/page.tsx`. `package.json` includes `@clerk/nextjs`. `.env.example` contains both Clerk env vars.

- [x] Complete TASK-017

---

### TASK-018 — Auth generator: NextAuth
**Files:** `src/generators/auth/nextauth.ts`, `templates/auth/nextauth/app/api/auth/route.ts`, `templates/auth/nextauth/auth.ts`

Route handler and `auth.ts` config. Merges `next-auth` dep. Appends `AUTH_SECRET` to `.env.example`.

**Success:** Output contains both files. `package.json` includes `next-auth`. `.env.example` contains `AUTH_SECRET`. (3 files total — generator + 2 templates.)

- [x] Complete TASK-018

---

### TASK-019 — Auth templates: Supabase Auth
**Files:** `templates/auth/supabase/utils/supabase/client.ts`, `templates/auth/supabase/utils/supabase/server.ts`, `templates/auth/supabase/middleware.ts`

Browser client, server client (SSR), and middleware using `@supabase/ssr`.

**Success:** Files exist. Client uses `createBrowserClient`. Server uses `createServerClient`. Middleware exports default.

- [x] Complete TASK-019

---

### TASK-020 — Auth generator: Supabase Auth
**Files:** `src/generators/auth/supabase-auth.ts`, `tests/generators/auth/supabase-auth.test.ts`

Copies 3 Supabase Auth templates to `outDir`. Merges `@supabase/ssr` and `@supabase/supabase-js`. Appends `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.example` only if not already present (dedup with Supabase DB).

**Success:** Output contains `utils/supabase/client.ts`, `utils/supabase/server.ts`, `middleware.ts`. `.env.example` contains both vars. Running the generator twice does not duplicate env vars.

- [x] Complete TASK-020

---

### TASK-021 — Database templates: Postgres
**Files:** `templates/database/postgres/drizzle.config.ts`, `templates/database/postgres/db/schema.ts`, `templates/database/postgres/db/index.ts`

Drizzle config pointing at `DATABASE_URL`. Schema stub with a `users` table. DB client using `drizzle` + `postgres`.

**Success:** Files exist and are valid UTF-8. `drizzle.config.ts` references `process.env.DATABASE_URL`.

- [x] Complete TASK-021

---

### TASK-022 — Database generator: Postgres
**Files:** `src/generators/database/postgres.ts`, `tests/generators/database/postgres.test.ts`

Copies 3 Postgres templates. Merges `drizzle-orm`, `postgres`, `drizzle-kit` (dev) deps. Appends `DATABASE_URL` to `.env.example`.

**Success:** Output contains all 3 files. `package.json` includes `drizzle-orm` and `postgres`. `.env.example` contains `DATABASE_URL`.

- [x] Complete TASK-022

---

### TASK-023 — Database templates: SQLite
**Files:** `templates/database/sqlite/drizzle.config.ts`, `templates/database/sqlite/db/schema.ts`, `templates/database/sqlite/db/index.ts`

Drizzle config for SQLite. Client uses `better-sqlite3`. No env vars required.

**Success:** Files exist. `db/index.ts` does not reference `process.env`.

- [x] Complete TASK-023

---

### TASK-024 — Database generator: SQLite
**Files:** `src/generators/database/sqlite.ts`, `tests/generators/database/sqlite.test.ts`

Copies 3 SQLite templates. Merges `drizzle-orm`, `better-sqlite3`, `drizzle-kit` (dev) deps. Does not call `appendEnv`.

**Success:** Output contains all 3 files. `package.json` includes `better-sqlite3`. No `.env.example` created.

- [x] Complete TASK-024

---

### TASK-025 — Database generator: Supabase DB
**Files:** `src/generators/database/supabase-db.ts`, `templates/database/supabase/utils/supabase/client.ts`

Supabase JS client setup. Appends `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.example` only if not already present. Merges `@supabase/supabase-js` dep. Does not write `utils/supabase/client.ts` if it already exists (written by Supabase Auth generator).

**Success:** Output contains `utils/supabase/client.ts`. `package.json` includes `@supabase/supabase-js`. When Supabase Auth generator has already run, client file is not overwritten and env vars are not duplicated.

- [x] Complete TASK-025

---

### TASK-026 — Payments templates: Stripe
**Files:** `templates/payments/stripe/lib/stripe.ts`, `templates/payments/stripe/app/api/webhooks/stripe/route.ts`

Stripe client initialized from `STRIPE_SECRET_KEY`. Webhook handler stub with signature verification.

**Success:** Files exist. `lib/stripe.ts` exports a `stripe` instance. Route handler exports a `POST` function.

- [x] Complete TASK-026

---

### TASK-027 — Payments generator: Stripe
**Files:** `src/generators/payments/stripe.ts`, `tests/generators/payments/stripe.test.ts`

Copies 2 Stripe templates. Merges `stripe` dep. Appends `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.example`.

**Success:** Output contains both files. `package.json` includes `stripe`. `.env.example` contains both Stripe vars.

- [x] Complete TASK-027

---

### TASK-028 — Payments templates: Lemon Squeezy
**Files:** `templates/payments/lemonsqueezy/lib/lemonsqueezy.ts`, `templates/payments/lemonsqueezy/app/api/webhooks/lemonsqueezy/route.ts`

Lemon Squeezy client and webhook handler stub.

**Success:** Files exist. `lib/lemonsqueezy.ts` exports an initialized client. Route handler exports a `POST` function.

- [x] Complete TASK-028

---

### TASK-029 — Payments generator: Lemon Squeezy
**Files:** `src/generators/payments/lemonsqueezy.ts`, `tests/generators/payments/lemonsqueezy.test.ts`

Copies 2 LS templates. Merges `@lemonsqueezy/lemonsqueezy.js` dep. Appends `LEMONSQUEEZY_API_KEY` and `LEMONSQUEEZY_WEBHOOK_SECRET`.

**Success:** Output contains both files. `package.json` includes the dep. `.env.example` contains both vars.

- [x] Complete TASK-029

---

### TASK-030 — Email generator: Resend
**Files:** `src/generators/email/resend.ts`, `templates/email/resend/lib/email.ts`

`lib/email.ts` exports `sendEmail(to, subject, html)` using the Resend client. Merges `resend` dep. Appends `RESEND_API_KEY`.

**Success:** Output contains `lib/email.ts` with a `sendEmail` export. `package.json` includes `resend`. `.env.example` contains `RESEND_API_KEY`. (3 files total — generator + template + test.)

- [x] Complete TASK-030

---

### TASK-031 — Email generator: Postmark
**Files:** `src/generators/email/postmark.ts`, `templates/email/postmark/lib/email.ts`

Same contract as Resend. `sendEmail` uses Postmark client. Merges `postmark` dep. Appends `POSTMARK_API_TOKEN`.

**Success:** Output contains `lib/email.ts` with a `sendEmail` export. Shape is identical to Resend output. `.env.example` contains `POSTMARK_API_TOKEN`.

- [x] Complete TASK-031

---

### TASK-032 — Generator orchestrator
**Files:** `src/generators/index.ts`, `tests/generators/index.test.ts`

Accepts `ProjectConfig`. Calls generators in order: base → auth → database → payments (if set) → email (if set). On any generator throw, removes `outDir` and rethrows.

**Success:** Each sub-generator is called exactly once in the correct order (verified with vi.mock). On simulated failure in the third generator, `outDir` is removed and an error is thrown. Generators for null payments/email are not called.

- [x] Complete TASK-032

---

### TASK-033 — Wire init command end-to-end
**Files:** `src/commands/init.ts`

Replace stub. Runs all prompts in sequence → assembles `ProjectConfig` → validates with `projectConfigSchema` → calls generator orchestrator → optionally runs `pnpm install` in `outDir` based on final confirm prompt.

**Success:** `node dist/index.js init` (with mocked prompts returning a complete config) produces an `outDir` containing `app/layout.tsx` and `package.json`. Zod validation error aborts before any files are written.

- [x] Complete TASK-033

---

### TASK-034 — Integration test: full scaffold
**Files:** `tests/generators/integration.test.ts`

Programmatically calls `generators/index.ts` with a representative set of configs. Minimum coverage: each auth × each database combination (9 combos), each with payments and email null.

**Success:** All 9 combinations complete without throwing. Each output directory contains `app/layout.tsx`, `package.json`, and the expected auth + database files (enumerated per combo). File count per combo matches a defined constant. `.env.example` contains no duplicate lines.

- [x] Complete TASK-034

---

### TASK-035 — README
**Files:** `README.md`

Document: install (`npm i -g saas-init` or `npx saas-init`), usage (`saas-init init`), supported stack options table, how to add a new provider (implement `generate(config, outDir)`, add templates, register in orchestrator).

**Success:** README is accurate against implemented CLI. Install and usage commands work verbatim against the built artifact.

- [x] Complete TASK-035
