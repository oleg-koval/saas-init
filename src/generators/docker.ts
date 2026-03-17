import path from 'path'
import { writeTemplate } from '../utils/files.js'
import { TEMPLATES_ROOT } from '../utils/paths.js'
import type { ProjectConfig } from '../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'docker')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const vars = { name: config.name }

  await Promise.all([
    writeTemplate(
      path.join(TEMPLATES_DIR, 'Dockerfile'),
      path.join(outDir, 'Dockerfile'),
      vars
    ),
    writeTemplate(
      path.join(TEMPLATES_DIR, '.dockerignore'),
      path.join(outDir, '.dockerignore'),
      vars
    ),
    writeTemplate(
      path.join(TEMPLATES_DIR, 'docker-compose.yml'),
      path.join(outDir, 'docker-compose.yml'),
      vars
    ),
  ])
}
