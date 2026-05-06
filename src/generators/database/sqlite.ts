import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'database/sqlite')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['drizzle.config.ts', 'drizzle.config.ts'],
    ['db/schema.ts', 'db/schema.ts'],
    ['db/index.ts', 'db/index.ts'],
  ]

  await Promise.all(
    files.map(([templateFile, destFile]) =>
      writeTemplate(path.join(TEMPLATES_DIR, templateFile), path.join(outDir, destFile), {})
    )
  )

  // Merge drizzle deps into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    'drizzle-orm': '^0.30.0',
    'better-sqlite3': '^9.0.0',
  })
  pkg.devDependencies = mergeDeps(pkg.devDependencies ?? {}, {
    'drizzle-kit': '^0.20.0',
    '@types/better-sqlite3': '^9.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // No appendEnv — SQLite uses a local file, no env vars required
}
