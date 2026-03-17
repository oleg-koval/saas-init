import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'email/resend')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  await writeTemplate(
    path.join(TEMPLATES_DIR, 'lib/email.ts'),
    path.join(outDir, 'lib/email.ts'),
    {}
  )

  // Merge resend dep into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    resend: '^4.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Resend env var to .env.example
  await appendEnv(outDir, {
    RESEND_API_KEY: 're_your_resend_api_key',
  })
}
