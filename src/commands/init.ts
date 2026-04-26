import { execSync } from 'child_process'
import * as p from '@clack/prompts'
import { projectConfigSchema } from '../types.js'
import { promptProject } from '../prompts/project.js'
import { promptAuth } from '../prompts/auth.js'
import { promptDatabase } from '../prompts/database.js'
import { promptPayments } from '../prompts/payments.js'
import { promptEmail } from '../prompts/email.js'
import { promptNextVersion } from '../prompts/next-version.js'
import { promptSummary } from '../prompts/summary.js'
import { promptEnvVars } from '../prompts/env-vars.js'
import { generate } from '../generators/index.js'
import { writeEnvLocal } from '../utils/files.js'

export async function initCommand(): Promise<void> {
  p.intro('saas-init')

  const { name, outDir } = await promptProject()
  const { nextVersion } = await promptNextVersion()
  const { auth } = await promptAuth()
  const { database } = await promptDatabase()
  const { payments } = await promptPayments()
  const { email } = await promptEmail()

  const rawConfig = { name, outDir, nextVersion, auth, database, payments, email }

  const parsed = projectConfigSchema.safeParse(rawConfig)
  if (!parsed.success) {
    p.cancel(`Invalid configuration: ${parsed.error.message}`)
    process.exit(1)
  }

  const config = parsed.data

  await promptSummary(config)

  const envVars = await promptEnvVars(config)

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

  await writeEnvLocal(config.outDir, envVars)
  spinner.stop('Files generated')

  const install = await p.confirm({ message: 'Install dependencies now?' })

  if (!p.isCancel(install) && install) {
    const installSpinner = p.spinner()
    installSpinner.start('Installing dependencies')
    try {
      execSync('pnpm install', { cwd: outDir, stdio: 'inherit' })
      installSpinner.stop('Dependencies installed')
    } catch (error) {
      installSpinner.stop('Failed to install dependencies')
      const message = error instanceof Error ? error.message : String(error)
      p.log.error(`pnpm install failed: ${message}`)
      p.log.warn('Run `pnpm install` manually in your project directory to install dependencies')
    }
  }

  p.outro(`Done! Your project is ready at ${outDir}`)
}
