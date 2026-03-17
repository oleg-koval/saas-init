import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'payments/stripe')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['lib/stripe.ts', 'lib/stripe.ts'],
    ['app/api/webhooks/stripe/route.ts', 'app/api/webhooks/stripe/route.ts'],
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

  // Merge stripe dep into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    stripe: '^14.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Stripe env vars to .env.example
  await appendEnv(outDir, {
    STRIPE_SECRET_KEY: '[your-stripe-secret-key]',
    STRIPE_WEBHOOK_SECRET: '[your-stripe-webhook-secret]',
  })
}
