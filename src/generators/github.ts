import path from 'path'
import { writeTemplate, appendEnv } from '../utils/files.js'
import { TEMPLATES_ROOT } from '../utils/paths.js'
import type { ProjectConfig } from '../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'github')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const vars = { name: config.name }

  await writeTemplate(
    path.join(TEMPLATES_DIR, '.github', 'workflows', 'ci.yml'),
    path.join(outDir, '.github', 'workflows', 'ci.yml'),
    vars
  )

  await appendEnv(outDir, {
    VERCEL_TOKEN: '',
    VERCEL_ORG_ID: '',
    VERCEL_PROJECT_ID: '',
  })
}
