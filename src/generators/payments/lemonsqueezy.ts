import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'payments/lemonsqueezy')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['lib/lemonsqueezy.ts', 'lib/lemonsqueezy.ts'],
    ['app/api/webhooks/lemonsqueezy/route.ts', 'app/api/webhooks/lemonsqueezy/route.ts'],
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

  // Merge lemonsqueezy dep into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    '@lemonsqueezy/lemonsqueezy.js': '^3.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Lemon Squeezy env vars to .env.example
  await appendEnv(outDir, {
    LEMONSQUEEZY_API_KEY: 'your_lemonsqueezy_api_key',
    LEMONSQUEEZY_WEBHOOK_SECRET: 'your_webhook_secret',
  })
}
