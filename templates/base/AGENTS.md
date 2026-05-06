# AGENTS.md

Instructions for AI coding agents working in this project.

## Hard rules

This project obeys the hard rules at:
<https://github.com/oleg-koval/starters/blob/main/RULES.md>

Key constraints enforced by tooling:

- **File length**: 300 lines hard cap (ESLint `max-lines`)
- **Pre-commit hooks**: lefthook runs typecheck → lint → format → test on every commit
- **Architecture**: Vertical Slice — each feature owns its handler, service, types, and tests
- **No WHAT-comments**: only single-line WHY notes for non-obvious constraints
- **E2E tests > unit tests**: test through the public interface, not internals

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier
- `pnpm typecheck` — tsc
- `pnpm test` — run tests

## Architecture

Use Vertical Slice Architecture. Each feature is self-contained:

```
features/
  billing/
    route.ts        ← Next.js route handler
    service.ts      ← business logic, no side effects
    types.ts        ← Zod schemas and DTOs
    billing.test.ts ← E2E test hitting the route
  auth/
    ...
```

Do not create shared `services/` or `repositories/` layers. Shared infrastructure
(DB client, logger, auth middleware) lives in `lib/`.

## Don't

- Don't bypass pre-commit hooks with `--no-verify` — rejected in code review
- Don't create files longer than 300 lines — split at natural seams before hitting the cap
- Don't add comments that explain what the code does — rename the function instead
