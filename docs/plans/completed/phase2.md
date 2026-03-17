# saas-init — Phase 2 Plan

## Validation Commands

```bash
pnpm build && pnpm test
```

Run after every task. All 25 existing test files must continue to pass.

---

## Overview

Four always-on additions — no new prompts, no new `ProjectConfig` fields. Each is implemented as a new generator called unconditionally by the orchestrator after `base`. Execution order becomes:

```
base → landing → auth → database → payments → email → docker → github
```

New files added to the repo:

```
src/generators/
  landing.ts
  docker.ts
  github.ts

templates/
  landing/
    components/
      Hero.tsx
      ProblemAgitate.tsx
      ValueStack.tsx
      SocialProof.tsx
      Transformation.tsx
      SecondaryCTA.tsx
      Footer.tsx
    app/page.tsx
  docker/
    Dockerfile
    .dockerignore
    docker-compose.yml
  github/
    .github/workflows/ci.yml

tests/generators/
  landing.test.ts
  docker.test.ts
  github.test.ts
```

---

## Variable substitution for landing page

All substitutions use the existing `replaceVars` utility. `{{name}}` is the only var sourced from `ProjectConfig` at generation time. All others use hardcoded placeholder strings — obvious TODOs the developer replaces post-generation.

| Placeholder | Value at generation time |
|---|---|
| `{{name}}` | `config.name` |
| `{{tagline}}` | `'Your tagline here'` |
| `{{problemStatement}}` | `'The core problem you solve'` |
| `{{feature1}}` `{{feature2}}` `{{feature3}}` | `'Feature one'` `'Feature two'` `'Feature three'` |
| `{{price}}` | `'99'` |

---

## Tasks

---

### TASK-P2-001 — Tailwind v4 + shadcn/ui: templates + generator update

**Files:** `templates/base/app/globals.css`, `templates/base/postcss.config.mjs`, `templates/base/components.json`, `templates/base/lib/utils.ts`, `src/generators/base.ts`, `tests/generators/base.test.ts`

**Templates:**

`globals.css` — replace existing minimal reset with Tailwind v4 style. Top line: `@import "tailwindcss"`. Follow with CSS custom properties for light/dark design tokens (`--background`, `--foreground`, etc.) using `@theme inline`.

`postcss.config.mjs` — export `{ plugins: { '@tailwindcss/postcss': {} } }`. No `tailwind.config.ts` — v4 config lives in CSS.

`components.json` — shadcn/ui config: `style: "new-york"`, `tailwind.cssVariables: true`, `tsx: true`, path aliases `@/components` and `@/lib/utils`.

`lib/utils.ts` — exports `cn(...inputs: ClassValue[])` using `clsx` and `tailwind-merge`.

**Generator:** add `postcss.config.mjs` and `lib/utils.ts` to the files list in `base.ts`. In `mergeDeps`, add `tailwindcss` and `@tailwindcss/postcss` to `devDependencies`; add `clsx` and `tailwind-merge` to `dependencies`.

**Tests:** assert `postcss.config.mjs` and `lib/utils.ts` exist in output; assert generated `package.json` has `tailwindcss` in `devDependencies` and `clsx` in `dependencies`; assert `globals.css` contains `@import "tailwindcss"`.

**Validation:**
```bash
pnpm build && pnpm test
grep '@import "tailwindcss"' templates/base/app/globals.css
grep '@tailwindcss/postcss' templates/base/postcss.config.mjs
grep 'export function cn' templates/base/lib/utils.ts
```

- [x] Complete TASK-P2-001

---

### TASK-P2-002 — Landing page: section component templates

**Files:** `templates/landing/components/Hero.tsx`, `templates/landing/components/ProblemAgitate.tsx`, `templates/landing/components/ValueStack.tsx`, `templates/landing/components/SocialProof.tsx`

All components are plain server-side functional components — no `'use client'`, no hooks, no external imports beyond React types.

**Hero** — eyebrow badge, `<h1>` containing `{{name}}` and `{{tagline}}`, subheadline with `{{problemStatement}}`, primary CTA button ("Get started"), trust signal row: 3 avatar circles + "Trusted by companies like yours".

**ProblemAgitate** — section heading "You're probably dealing with…", 3 problem cards each with an icon placeholder (`▸`), a bold problem label, and a one-sentence agitation paragraph. All problem copy is placeholder text.

**ValueStack** — heading "Everything you need", 4 value tier rows (icon + label + "valued at $X"), a "Total value: $XXX" summary line, price callout "Yours today for just ${{price}}", CTA button.

**SocialProof** — heading "What our customers say", 3 testimonial cards each with a circle avatar placeholder, block-quoted testimonial text, customer name, and role/company. All testimonial copy is placeholder text.

**Validation:**
```bash
grep '{{name}}' templates/landing/components/Hero.tsx
grep '{{tagline}}' templates/landing/components/Hero.tsx
grep '{{price}}' templates/landing/components/ValueStack.tsx
# 3 problem blocks in ProblemAgitate
grep -c 'problem-card\|ProblemCard\|problem_' templates/landing/components/ProblemAgitate.tsx
```

- [x] Complete TASK-P2-002

---

### TASK-P2-003 — Landing page: remaining section templates + page assembly

**Files:** `templates/landing/components/Transformation.tsx`, `templates/landing/components/SecondaryCTA.tsx`, `templates/landing/components/Footer.tsx`, `templates/landing/app/page.tsx`

**Transformation** — heading "Your journey with `{{name}}`", 4 numbered stage cards connected by arrow separators: ① Quick Win (day 1), ② Compound (week 1), ③ Advantage (month 1), ④ 10x (month 3+). Each card has a stage label, time marker, and outcome description placeholder.

**SecondaryCTA** — 3 overlapping avatar circles, question copy "Ready to join them?", single large "Yes — get started with `{{name}}`" button.

**Footer** — logo text `{{name}}`, horizontal nav links (Home, Features, Pricing, Blog — placeholder hrefs), legal line "© `{{name}}`. All rights reserved.", row of 3 social icon links (Twitter/X, GitHub, LinkedIn — placeholder hrefs).

**page.tsx** — imports all 7 components, renders in order inside `<main>`: Hero, ProblemAgitate, ValueStack, SocialProof, Transformation, SecondaryCTA, Footer. This file overwrites the base generator's `app/page.tsx`.

**Validation:**
```bash
grep '{{name}}' templates/landing/components/Transformation.tsx
grep '{{name}}' templates/landing/components/Footer.tsx
# all 7 components imported in page.tsx
for c in Hero ProblemAgitate ValueStack SocialProof Transformation SecondaryCTA Footer; do
  grep -q "$c" templates/landing/app/page.tsx && echo "$c ✓" || echo "$c MISSING"
done
```

- [x] Complete TASK-P2-003

---

### TASK-P2-004 — Landing page generator

**Files:** `src/generators/landing.ts`, `tests/generators/landing.test.ts`

Copies all 8 landing templates to `outDir` using `writeTemplate` with the full vars map from the substitution contract above. `app/page.tsx` is written last and intentionally overwrites the base generator's version.

**Tests:** assert all 8 output files exist; assert `Hero.tsx` and `Footer.tsx` contain `config.name` and do not contain `{{name}}`; assert no file in the output contains any unresolved `{{` token.

**Validation:**
```bash
pnpm build && pnpm test -- tests/generators/landing.test.ts
```

- [x] Complete TASK-P2-004

---

### TASK-P2-005 — Docker: templates + generator

**Files:** `templates/docker/Dockerfile`, `templates/docker/.dockerignore`, `templates/docker/docker-compose.yml`, `src/generators/docker.ts`, `tests/generators/docker.test.ts`

**Dockerfile** — 3-stage multi-stage build:
1. `deps` — `node:20-alpine`, copies `package.json` + lockfile, runs `pnpm install --frozen-lockfile`
2. `builder` — copies all source, runs `pnpm build`
3. `runner` — `node:20-alpine`, `NODE_ENV=production`, copies `.next/standalone` + `.next/static`, `EXPOSE 3000`, `CMD ["node", "server.js"]`

Uses `{{name}}` in `LABEL app="{{name}}"`.

**docker-compose.yml** — service named after `{{name}}`, `build: .`, `ports: ["3000:3000"]`, `env_file: .env.local`. Includes a commented-out postgres service block for projects that choose Postgres.

**.dockerignore** — `node_modules`, `.next`, `.git`, `.env.local`, `*.test.*`.

**Generator:** writes all 3 templates via `writeTemplate` (`.dockerignore` has no vars but goes through `writeTemplate` for consistency).

**Tests:** assert all 3 files exist; assert `Dockerfile` has 3 `FROM` statements; assert `docker-compose.yml` contains `config.name` and no `{{name}}`; assert `.dockerignore` contains `node_modules`.

**Validation:**
```bash
pnpm build && pnpm test -- tests/generators/docker.test.ts
grep -c '^FROM' templates/docker/Dockerfile   # expect 3
grep '{{name}}' templates/docker/docker-compose.yml
```

- [x] Complete TASK-P2-005

---

### TASK-P2-006 — GitHub Actions CI/CD: template + generator

**Files:** `templates/github/.github/workflows/ci.yml`, `src/generators/github.ts`, `tests/generators/github.test.ts`

**ci.yml** — workflow named `CI — {{name}}`, triggers on push to `main` and on `pull_request`. Three sequential jobs:

`test` — `ubuntu-latest`, checkout + setup pnpm + `pnpm install --frozen-lockfile` + `pnpm test`

`build` — `needs: test`, runs `pnpm build`, uploads `.next` as artifact (retention: 1 day)

`deploy` — `needs: build`, `if: github.ref == 'refs/heads/main'`, uses `amondnet/vercel-action@v25`, reads `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` from `secrets`, deploys with `--prod`

**Generator:** writes `ci.yml` to `outDir/.github/workflows/ci.yml` via `writeTemplate`. Calls `appendEnv` to add `VERCEL_TOKEN=`, `VERCEL_ORG_ID=`, `VERCEL_PROJECT_ID=` (empty values) to `.env.example`.

**Tests:** assert `ci.yml` exists at the nested path; assert workflow name contains `config.name` and no `{{name}}`; assert `.env.example` contains all 3 Vercel vars; assert running the generator twice does not duplicate env vars.

**Validation:**
```bash
pnpm build && pnpm test -- tests/generators/github.test.ts
grep '{{name}}' templates/github/.github/workflows/ci.yml
grep -c 'VERCEL_' templates/github/.github/workflows/ci.yml   # expect 3
```

- [x] Complete TASK-P2-006

---

### TASK-P2-007 — Wire all new generators into orchestrator

**Files:** `src/generators/index.ts`, `tests/generators/index.test.ts`

Import `generateLanding`, `generateDocker`, `generateGithub`. Insert calls in the `try` block:

```
generateBase → generateLanding → auth → database → payments → email → generateDocker → generateGithub
```

Landing runs immediately after base so it can overwrite `app/page.tsx` before auth/db generators potentially add to the app directory. Docker and GitHub run last — they wrap the project, not the app code.

**Tests:** update `index.test.ts` to assert all 3 new generators are called exactly once per run for any config. Existing assertions for all 11 prior generators must still pass.

**Validation:**
```bash
pnpm build && pnpm test
node dist/index.js --version
node dist/index.js --help
```

- [x] Complete TASK-P2-007
