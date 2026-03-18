import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'auth/clerk')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['middleware.ts', 'middleware.ts'],
    ['app/sign-in/[[...sign-in]]/page.tsx', 'app/sign-in/[[...sign-in]]/page.tsx'],
    ['app/sign-up/[[...sign-up]]/page.tsx', 'app/sign-up/[[...sign-up]]/page.tsx'],
  ]

  await Promise.all(
    files.map(([templateFile, destFile]) =>
      writeTemplate(
        path.join(TEMPLATES_DIR, templateFile),
        path.join(outDir, destFile),
        {}
      )
    )
  )

  // Merge @clerk/nextjs into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    '@clerk/nextjs': '^6.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Clerk env vars to .env.example
  await appendEnv(outDir, {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_CHANGE_ME_clerk_publishable_key',
    CLERK_SECRET_KEY: 'sk_CHANGE_ME_clerk_secret_key',
  })
}
