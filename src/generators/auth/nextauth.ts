import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'auth/nextauth')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['app/api/auth/route.ts', 'app/api/auth/[...nextauth]/route.ts'],
    ['auth.ts', 'auth.ts'],
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

  // Merge next-auth into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    'next-auth': '^5.0.0-beta.25',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append NextAuth env vars to .env.example
  await appendEnv(outDir, {
    AUTH_SECRET: 'your_auth_secret_here',
    AUTH_URL: 'http://localhost:3000',
  })
}
