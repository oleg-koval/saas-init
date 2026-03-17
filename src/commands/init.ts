import { execSync } from 'child_process'
import * as p from '@clack/prompts'
import { projectConfigSchema } from '../types.js'
import { promptProject } from '../prompts/project.js'
import { promptAuth } from '../prompts/auth.js'
import { promptDatabase } from '../prompts/database.js'
import { promptPayments } from '../prompts/payments.js'
import { promptEmail } from '../prompts/email.js'
import { promptSummary } from '../prompts/summary.js'
import { generate } from '../generators/index.js'

export async function initCommand(): Promise<void> {
  p.intro('saas-init')

  const { name, outDir } = await promptProject()
  const { auth } = await promptAuth()
  const { database } = await promptDatabase()
  const { payments } = await promptPayments()
  const { email } = await promptEmail()

  const rawConfig = { name, outDir, auth, database, payments, email }

  const parsed = projectConfigSchema.safeParse(rawConfig)
  if (!parsed.success) {
    p.cancel(`Invalid configuration: ${parsed.error.message}`)
    process.exit(1)
  }

  const config = parsed.data

  await promptSummary(config)

  const spinner = p.spinner()
  spinner.start('Generating project files')

  try {
    await generate(config)
  } catch (error) {
    spinner.stop('Generation failed')
    const message = error instanceof Error ? error.message : String(error)
    p.cancel(`Generation failed: ${message}`)
    process.exit(1)
  }

  spinner.stop('Files generated')

  const install = await p.confirm({ message: 'Install dependencies now?' })

  if (!p.isCancel(install) && install) {
    const installSpinner = p.spinner()
    installSpinner.start('Installing dependencies')
    try {
      execSync('pnpm install', { cwd: outDir, stdio: 'ignore' })
      installSpinner.stop('Dependencies installed')
    } catch {
      installSpinner.stop('Failed to install dependencies')
      p.log.warn('Run `pnpm install` manually to install dependencies')
    }
  }

  p.outro(`Done! Your project is ready at ${outDir}`)
}
