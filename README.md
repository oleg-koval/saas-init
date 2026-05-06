# saas-init

[![npm version](https://img.shields.io/npm/v/saas-init?color=blue)](https://www.npmjs.com/package/saas-init)
[![npm downloads](https://img.shields.io/npm/dm/saas-init)](https://www.npmjs.com/package/saas-init)
[![CI](https://github.com/oleg-koval/saas-init/actions/workflows/ci.yml/badge.svg)](https://github.com/oleg-koval/saas-init/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/node/v/saas-init)](https://nodejs.org)

CLI scaffolding tool that generates production-ready SaaS projects on top of Next.js.

## Install

```bash
npm install -g saas-init
```

Or use directly without installing:

```bash
npx saas-init init
```

## Usage

```bash
saas-init init
```

The CLI walks you through a short prompt sequence:

1. Project name (lowercase, npm-valid, e.g. `my-app`)
2. Output directory (default: `./<project-name>`)
3. Auth provider
4. Database
5. Payments (optional)
6. Email (optional)
7. Summary — confirm before any files are written

After confirming, saas-init generates the project files and optionally runs `pnpm install` in the output directory.

## What's Included

Every generated project comes with:

- **Landing Page**: Production-ready landing page with multiple sections (hero, problem agitate, value proposition, social proof, transformation, CTA, footer). Fully customizable via template variables.
- **Docker**: Pre-configured `Dockerfile` and `docker-compose.yml` for easy containerization.
- **GitHub Actions**: Automated CI workflow for testing and linting on every push and PR.

## Supported Stack Options

| Category | Options                                        |
| -------- | ---------------------------------------------- |
| Auth     | Clerk, NextAuth, Supabase Auth                 |
| Database | Postgres (Drizzle), SQLite (Drizzle), Supabase |
| Payments | Stripe, Lemon Squeezy, None                    |
| Email    | Resend, Postmark, None                         |

## Adding a New Provider

1. Add templates under `templates/<category>/<provider>/`. Use `{{key}}` placeholders for variables that come from `ProjectConfig`.

2. Create a generator at `src/generators/<category>/<provider>.ts` that exports:

   ```ts
   export async function generate(config: ProjectConfig, outDir: string): Promise<void>
   ```

   Inside it, use the file utilities to copy templates and merge dependencies:

   ```ts
   import path from 'path'
   import fs from 'fs-extra'
   import { writeTemplate, appendEnv } from '../../utils/files.js'
   import { mergeDeps } from '../../utils/deps.js'
   import { TEMPLATES_ROOT } from '../../utils/paths.js'

   const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, '<category>/<provider>')

   export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
     await writeTemplate(
       path.join(TEMPLATES_DIR, 'lib/client.ts'),
       path.join(outDir, 'lib/client.ts'),
       {}
     )
     const pkgPath = path.join(outDir, 'package.json')
     const pkg = await fs.readJson(pkgPath)
     pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, { '<package>': '^1.0.0' })
     await fs.writeJson(pkgPath, pkg, { spaces: 2 })
     await appendEnv(outDir, { MY_API_KEY: '' })
   }
   ```

3. Register the generator in `src/generators/index.ts` by adding it to the relevant map (e.g. `authGenerators`, `databaseGenerators`, etc.).

4. Add the new value to the relevant union type in `src/types.ts` and the matching zod enum in `projectConfigSchema`.

5. Add a prompt option in `src/prompts/<category>.ts`.

6. Write tests in `tests/generators/<category>/<provider>.test.ts` following the patterns of existing generator tests.

## Requirements

- Node.js >= 18
- pnpm (for generated projects)
