# saas-init — Agent Instructions

## Project
CLI scaffolding tool that generates production-ready SaaS projects. Distributed via npm.

## Stack
- **Runtime:** Node.js / TypeScript
- **Output frameworks:** Next.js
- **Auth options:** Clerk, NextAuth, Supabase Auth
- **Payment options:** Stripe, Lemon Squeezy
- **Database options:** Postgres, SQLite, Supabase
- **Email options:** Resend, Postmark

## Repo Layout
- `src/` — CLI source (commands, prompts, generators)
- `templates/` — file templates per stack combination
- `tests/` — unit + integration tests

## Dev Workflow
- Language: TypeScript, strict mode
- Package manager: pnpm
- Lint/format: ESLint + Prettier
- Tests: `pnpm test`
- Build: `pnpm build`
- Local smoke test: `node dist/index.js init`

## Code Standards
- No default exports except where framework requires
- Prefer named exports and explicit types — avoid `any`
- Each generator module handles one concern (auth, db, payments, email)
- Templates are plain files with `{{variable}}` placeholders — no runtime templating libs
- CLI prompts via `@clack/prompts` — keep UX tight and sequential
- Write tests for generator output, not just CLI flags

## Constraints
- Do not add dependencies without asking
- Do not modify templates for stacks not mentioned in the task
- Do not scaffold boilerplate beyond what was asked
- Keep generated projects minimal — no unused packages
