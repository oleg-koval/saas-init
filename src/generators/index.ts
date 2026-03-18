import fs from 'fs-extra'
import type { ProjectConfig } from '../types.js'
import { generate as generateBase } from './base.js'
import { generate as generateClerk } from './auth/clerk.js'
import { generate as generateNextAuth } from './auth/nextauth.js'
import { generate as generateSupabaseAuth } from './auth/supabase-auth.js'
import { generate as generatePostgres } from './database/postgres.js'
import { generate as generateSqlite } from './database/sqlite.js'
import { generate as generateSupabaseDb } from './database/supabase-db.js'
import { generate as generateStripe } from './payments/stripe.js'
import { generate as generateLemonSqueezy } from './payments/lemonsqueezy.js'
import { generate as generateResend } from './email/resend.js'
import { generate as generatePostmark } from './email/postmark.js'
import { generate as generateLanding } from './landing.js'
import { generate as generateDocker } from './docker.js'
import { generate as generateGithub } from './github.js'

export async function generate(config: ProjectConfig): Promise<void> {
  const { outDir } = config

  const dirExistedBefore = await fs.pathExists(outDir)

  // Verify output directory is writable
  try {
    await fs.ensureDir(outDir)
    const testFile = '.writability-check'
    await fs.writeFile(`${outDir}/${testFile}`, '')
    await fs.remove(`${outDir}/${testFile}`)
  } catch {
    throw new Error(`Output directory "${outDir}" is not writable or cannot be created. Check permissions and try again.`)
  }

  const authGenerators = {
    clerk: generateClerk,
    nextauth: generateNextAuth,
    supabase: generateSupabaseAuth,
  }

  const databaseGenerators = {
    postgres: generatePostgres,
    sqlite: generateSqlite,
    supabase: generateSupabaseDb,
  }

  const paymentsGenerators = {
    stripe: generateStripe,
    lemonsqueezy: generateLemonSqueezy,
  }

  const emailGenerators = {
    resend: generateResend,
    postmark: generatePostmark,
  }

  try {
    await generateBase(config, outDir)
    await generateLanding(config, outDir)

    const authGenerator = authGenerators[config.auth]
    if (!authGenerator) {
      throw new Error(`No generator found for auth provider: ${config.auth}`)
    }
    await authGenerator(config, outDir)

    const databaseGenerator = databaseGenerators[config.database]
    if (!databaseGenerator) {
      throw new Error(`No generator found for database provider: ${config.database}`)
    }
    await databaseGenerator(config, outDir)

    if (config.payments !== null) {
      const paymentsGenerator = paymentsGenerators[config.payments]
      if (!paymentsGenerator) {
        throw new Error(`No generator found for payments provider: ${config.payments}`)
      }
      await paymentsGenerator(config, outDir)
    }

    if (config.email !== null) {
      const emailGenerator = emailGenerators[config.email]
      if (!emailGenerator) {
        throw new Error(`No generator found for email provider: ${config.email}`)
      }
      await emailGenerator(config, outDir)
    }

    await generateDocker(config, outDir)
    await generateGithub(config, outDir)
  } catch (err) {
    if (!dirExistedBefore) {
      await fs.remove(outDir)
    } else {
      const { log } = await import('@clack/prompts')
      log.warn(`Generation failed. The directory "${outDir}" may be in a partial state.`)
    }
    throw err
  }
}
