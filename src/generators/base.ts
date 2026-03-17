import path from 'path'
import { writeTemplate } from '../utils/files.js'
import { TEMPLATES_ROOT } from '../utils/paths.js'
import type { ProjectConfig } from '../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'base')

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const vars = { name: config.name }

  const files: [string, string][] = [
    ['app/layout.tsx', 'app/layout.tsx'],
    ['app/page.tsx', 'app/page.tsx'],
    ['app/globals.css', 'app/globals.css'],
    ['next.config.ts', 'next.config.ts'],
    ['tsconfig.json', 'tsconfig.json'],
    ['package.json', 'package.json'],
    ['.gitignore', '.gitignore'],
  ]

  await Promise.all(
    files.map(([templateFile, destFile]) =>
      writeTemplate(
        path.join(TEMPLATES_DIR, templateFile),
        path.join(outDir, destFile),
        vars
      )
    )
  )
}
