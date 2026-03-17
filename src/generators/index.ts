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

export async function generate(config: ProjectConfig): Promise<void> {
  const { outDir } = config

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

  const dirExistedBefore = await fs.pathExists(outDir)

  try {
    await generateBase(config, outDir)
    await authGenerators[config.auth](config, outDir)
    await databaseGenerators[config.database](config, outDir)

    if (config.payments !== null) {
      await paymentsGenerators[config.payments](config, outDir)
    }

    if (config.email !== null) {
      await emailGenerators[config.email](config, outDir)
    }
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
