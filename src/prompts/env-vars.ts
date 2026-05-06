import * as p from '@clack/prompts'
import { randomBytes } from 'crypto'
import type { ProjectConfig } from '../types.js'

export type EnvVars = Record<string, string>

function cancel(_value: unknown): never {
  p.cancel('Operation cancelled')
  process.exit(0)
}

function requireText(value: unknown): never | string {
  if (p.isCancel(value)) cancel(value)
  return value as string
}

async function ask(message: string, placeholder?: string, defaultValue?: string): Promise<string> {
  const value = await p.text({ message, placeholder, defaultValue })
  return requireText(value)
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function promptSupabaseVars(): Promise<EnvVars> {
  p.log.step('Supabase — supabase.com → your project → Settings → API')
  const url = await ask('Project URL', 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co')
  const anonKey = await ask('Anon (public) key')
  const serviceKey = await ask('Service role key (secret — keep private)')
  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  }
}

async function promptClerkVars(): Promise<EnvVars> {
  p.log.step('Clerk — clerk.com → your app → API Keys')
  const publishableKey = await ask('Publishable key', 'pk_test_...')
  const secretKey = await ask('Secret key', 'sk_test_...')
  return {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
    CLERK_SECRET_KEY: secretKey,
  }
}

async function promptNextAuthVars(): Promise<EnvVars> {
  p.log.step('NextAuth')
  const secret = randomBytes(32).toString('hex')
  p.log.info(`Generated AUTH_SECRET: ${secret}`)
  return {
    AUTH_SECRET: secret,
    AUTH_URL: 'http://localhost:3000',
  }
}

// ─── Database ────────────────────────────────────────────────────────────────

async function promptPostgresVars(): Promise<EnvVars> {
  p.log.step('Postgres — enter your connection string')
  const url = await ask(
    'Database URL',
    'postgresql://user:password@localhost:5432/mydb',
    'postgresql://user:password@localhost:5432/mydb'
  )
  return { DATABASE_URL: url }
}

// ─── Payments ────────────────────────────────────────────────────────────────

async function promptStripeVars(): Promise<EnvVars> {
  p.log.step('Stripe — stripe.com → Developers → API keys')
  const secretKey = await ask('Secret key', 'sk_test_...')
  p.log.info(
    'Webhook secret: add your endpoint after deploy → Developers → Webhooks → copy the signing secret'
  )
  const webhookSecret = await ask('Webhook secret (or leave blank to fill later)', 'whsec_...', '')
  return {
    STRIPE_SECRET_KEY: secretKey,
    STRIPE_WEBHOOK_SECRET: webhookSecret || 'whsec_CHANGE_ME',
  }
}

async function promptLemonSqueezyVars(): Promise<EnvVars> {
  p.log.step('Lemon Squeezy — app.lemonsqueezy.com → Settings → API')
  const apiKey = await ask('API key')
  const webhookSecret = await ask('Webhook secret (or leave blank to fill later)', '', '')
  return {
    LEMONSQUEEZY_API_KEY: apiKey,
    LEMONSQUEEZY_WEBHOOK_SECRET: webhookSecret || 'CHANGE_ME',
  }
}

// ─── Email ───────────────────────────────────────────────────────────────────

async function promptResendVars(): Promise<EnvVars> {
  p.log.step('Resend — resend.com → API Keys → Create API key')
  const apiKey = await ask('API key', 're_...')
  return { RESEND_API_KEY: apiKey }
}

async function promptPostmarkVars(): Promise<EnvVars> {
  p.log.step('Postmark — account.postmarkapp.com → Servers → your server → API Tokens')
  const token = await ask('Server API token')
  return { POSTMARK_API_TOKEN: token }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function promptEnvVars(config: ProjectConfig): Promise<EnvVars> {
  p.log.message('')
  p.log.message("Now let's configure your services.")
  p.log.message('Follow the links below to find each value.')
  p.log.message('')

  const vars: EnvVars = {}

  // Auth
  if (config.auth === 'supabase') {
    Object.assign(vars, await promptSupabaseVars())
  } else if (config.auth === 'clerk') {
    Object.assign(vars, await promptClerkVars())
  } else if (config.auth === 'nextauth') {
    Object.assign(vars, await promptNextAuthVars())
  }

  // Database (dedupe Supabase keys already collected above)
  if (config.database === 'postgres') {
    Object.assign(vars, await promptPostgresVars())
  } else if (config.database === 'supabase' && config.auth !== 'supabase') {
    // Only prompt if Supabase auth didn't already collect these
    Object.assign(vars, await promptSupabaseVars())
  }

  // Payments
  if (config.payments === 'stripe') {
    Object.assign(vars, await promptStripeVars())
  } else if (config.payments === 'lemonsqueezy') {
    Object.assign(vars, await promptLemonSqueezyVars())
  }

  // Email
  if (config.email === 'resend') {
    Object.assign(vars, await promptResendVars())
  } else if (config.email === 'postmark') {
    Object.assign(vars, await promptPostmarkVars())
  }

  return vars
}
