import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../../utils/files.js'
import { appendEnv } from '../../utils/files.js'
import { mergeDeps } from '../../utils/deps.js'
import { TEMPLATES_ROOT } from '../../utils/paths.js'
import type { ProjectConfig } from '../../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'database/supabase')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  await writeTemplate(
    path.join(TEMPLATES_DIR, 'utils/supabase/db.ts'),
    path.join(outDir, 'utils/supabase/db.ts'),
    {}
  )

  // Write browser client only when Supabase Auth is not selected (it writes its own client.ts)
  if (config.auth !== 'supabase') {
    await writeTemplate(
      path.join(TEMPLATES_DIR, 'utils/supabase/client.ts'),
      path.join(outDir, 'utils/supabase/client.ts'),
      {}
    )
  }

  // Merge @supabase/supabase-js dep into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    '@supabase/supabase-js': '^2.0.0',
  })
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })

  // Append Supabase env vars to .env.example (deduped by appendEnv)
  await appendEnv(outDir, {
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
  })
}
