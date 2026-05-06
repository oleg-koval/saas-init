import path from 'path'
import fs from 'fs-extra'
import { writeTemplate } from '../utils/files.js'
import { mergeDeps } from '../utils/deps.js'
import { TEMPLATES_ROOT } from '../utils/paths.js'
import type { ProjectConfig } from '../types.js'

const TEMPLATES_DIR = path.join(TEMPLATES_ROOT, 'base')

const NEXT_VERSION_MAP: Record<string, string> = {
  '15': '^15.3.0',
  '16': '^16.2.0',
}

export async function generate(config: ProjectConfig, outDir: string): Promise<void> {
  const vars = {
    name: config.name,
    nextVersion: NEXT_VERSION_MAP[config.nextVersion] ?? config.nextVersion,
  }

  const files: [string, string][] = [
    ['app/layout.tsx', 'app/layout.tsx'],
    ['app/page.tsx', 'app/page.tsx'],
    ['app/globals.css', 'app/globals.css'],
    ['next.config.ts', 'next.config.ts'],
    ['tsconfig.json', 'tsconfig.json'],
    ['package.json', 'package.json'],
    ['.gitignore', '.gitignore'],
    ['postcss.config.mjs', 'postcss.config.mjs'],
    ['lib/utils.ts', 'lib/utils.ts'],
    ['components.json', 'components.json'],
    ['eslint.config.mjs', 'eslint.config.mjs'],
    ['lefthook.yml', 'lefthook.yml'],
    ['AGENTS.md', 'AGENTS.md'],
  ]

  await Promise.all(
    files.map(([templateFile, destFile]) =>
      writeTemplate(path.join(TEMPLATES_DIR, templateFile), path.join(outDir, destFile), vars)
    )
  )

  // Merge Tailwind v4 and shadcn/ui dependencies into package.json
  const pkgPath = path.join(outDir, 'package.json')
  const pkg = await fs.readJson(pkgPath)
  pkg.dependencies = mergeDeps(pkg.dependencies ?? {}, {
    clsx: '^2.0.0',
    'tailwind-merge': '^2.0.0',
  })
  pkg.devDependencies = mergeDeps(pkg.devDependencies ?? {}, {
    tailwindcss: '^4.0.0',
    '@tailwindcss/postcss': '^4.0.0',
    lefthook: '^1.11.0',
    'typescript-eslint': '^8.0.0',
  })
  pkg.scripts = {
    ...pkg.scripts,
    lint: 'eslint .',
    'lint:fix': 'eslint . --fix',
    format: 'prettier --write .',
    'format:check': 'prettier --check .',
    typecheck: 'tsc --noEmit',
    prepare: 'lefthook install',
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 })
}
