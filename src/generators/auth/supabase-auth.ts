import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'auth/supabase')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const files: [string, string][] = [
    ['utils/supabase/client.ts', 'utils/supabase/client.ts'],
    ['utils/supabase/server.ts', 'utils/supabase/server.ts'],
    ['middleware.ts', 'middleware.ts'],
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

  // Merge Supabase deps into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    '@supabase/ssr': '^0.5.0',
    '@supabase/supabase-js': '^2.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Supabase env vars to .env.example (deduped by appendEnv)
  await appendEnv(outDir, {
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
  })
}
