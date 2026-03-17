import * as p from '@clack/prompts'
import type { ProjectConfig } from '../types.js'

export async function promptSummary(config: ProjectConfig): Promise<void> {
  const lines = [
    `  name:      ${config.name}`,
    `  outDir:    ${config.outDir}`,
    `  auth:      ${config.auth}`,
    `  database:  ${config.database}`,
    `  payments:  ${config.payments ?? 'none'}`,
    `  email:     ${config.email ?? 'none'}`,
  ]

  p.note(lines.join('\n'), 'Project configuration')

  const confirmed = await p.confirm({ message: 'Generate project?' })

  if (p.isCancel(confirmed) || confirmed === false) {
    p.cancel('Aborted')
    process.exit(0)
  }
}
