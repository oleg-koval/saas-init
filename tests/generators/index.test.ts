import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'

// Mock all sub-generators
vi.mock('../../src/generators/base.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/auth/clerk.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/auth/nextauth.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/auth/supabase-auth.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/database/postgres.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/database/sqlite.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/database/supabase-db.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/payments/stripe.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/payments/lemonsqueezy.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/email/resend.js', () => ({ generate: vi.fn() }))
vi.mock('../../src/generators/email/postmark.js', () => ({ generate: vi.fn() }))

import { generate } from '../../src/generators/index.js'
import { generate as baseGen } from '../../src/generators/base.js'
import { generate as clerkGen } from '../../src/generators/auth/clerk.js'
import { generate as nextauthGen } from '../../src/generators/auth/nextauth.js'
import { generate as supabaseAuthGen } from '../../src/generators/auth/supabase-auth.js'
import { generate as postgresGen } from '../../src/generators/database/postgres.js'
import { generate as sqliteGen } from '../../src/generators/database/sqlite.js'
import { generate as supabaseDbGen } from '../../src/generators/database/supabase-db.js'
import { generate as stripeGen } from '../../src/generators/payments/stripe.js'
import { generate as lemonsqueezyGen } from '../../src/generators/payments/lemonsqueezy.js'
import { generate as resendGen } from '../../src/generators/email/resend.js'
import { generate as postmarkGen } from '../../src/generators/email/postmark.js'
import type { ProjectConfig } from '../../src/types.js'

const baseConfig: ProjectConfig = {
  name: 'test-app',
  outDir: '',
  auth: 'clerk',
  database: 'postgres',
  payments: null,
  email: null,
}

describe('generator orchestrator', () => {
  let outDir: string

  beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-orch-'))
    vi.clearAllMocks()
    ;(baseGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(clerkGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(nextauthGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(supabaseAuthGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(postgresGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(sqliteGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(supabaseDbGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(stripeGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(lemonsqueezyGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(resendGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(postmarkGen as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
  })

  it('calls base generator first', async () => {
    const config = { ...baseConfig, outDir }
    await generate(config)
    expect(baseGen).toHaveBeenCalledWith(config, outDir)
  })

  it('calls auth generators in correct order after base', async () => {
    const callOrder: string[] = []
    ;(baseGen as ReturnType<typeof vi.fn>).mockImplementation(async () => { callOrder.push('base') })
    ;(clerkGen as ReturnType<typeof vi.fn>).mockImplementation(async () => { callOrder.push('clerk') })
    ;(postgresGen as ReturnType<typeof vi.fn>).mockImplementation(async () => { callOrder.push('postgres') })

    const config = { ...baseConfig, outDir }
    await generate(config)
    expect(callOrder).toEqual(['base', 'clerk', 'postgres'])
  })

  it('calls nextauth generator when auth is nextauth', async () => {
    const config = { ...baseConfig, outDir, auth: 'nextauth' as const }
    await generate(config)
    expect(nextauthGen).toHaveBeenCalledWith(config, outDir)
    expect(clerkGen).not.toHaveBeenCalled()
    expect(supabaseAuthGen).not.toHaveBeenCalled()
  })

  it('calls supabase auth generator when auth is supabase', async () => {
    const config = { ...baseConfig, outDir, auth: 'supabase' as const }
    await generate(config)
    expect(supabaseAuthGen).toHaveBeenCalledWith(config, outDir)
    expect(clerkGen).not.toHaveBeenCalled()
    expect(nextauthGen).not.toHaveBeenCalled()
  })

  it('calls sqlite generator when database is sqlite', async () => {
    const config = { ...baseConfig, outDir, database: 'sqlite' as const }
    await generate(config)
    expect(sqliteGen).toHaveBeenCalledWith(config, outDir)
    expect(postgresGen).not.toHaveBeenCalled()
    expect(supabaseDbGen).not.toHaveBeenCalled()
  })

  it('calls supabase db generator when database is supabase', async () => {
    const config = { ...baseConfig, outDir, database: 'supabase' as const }
    await generate(config)
    expect(supabaseDbGen).toHaveBeenCalledWith(config, outDir)
    expect(postgresGen).not.toHaveBeenCalled()
    expect(sqliteGen).not.toHaveBeenCalled()
  })

  it('does not call payments generator when payments is null', async () => {
    const config = { ...baseConfig, outDir, payments: null }
    await generate(config)
    expect(stripeGen).not.toHaveBeenCalled()
    expect(lemonsqueezyGen).not.toHaveBeenCalled()
  })

  it('calls stripe generator when payments is stripe', async () => {
    const config = { ...baseConfig, outDir, payments: 'stripe' as const }
    await generate(config)
    expect(stripeGen).toHaveBeenCalledWith(config, outDir)
    expect(lemonsqueezyGen).not.toHaveBeenCalled()
  })

  it('calls lemonsqueezy generator when payments is lemonsqueezy', async () => {
    const config = { ...baseConfig, outDir, payments: 'lemonsqueezy' as const }
    await generate(config)
    expect(lemonsqueezyGen).toHaveBeenCalledWith(config, outDir)
    expect(stripeGen).not.toHaveBeenCalled()
  })

  it('does not call email generator when email is null', async () => {
    const config = { ...baseConfig, outDir, email: null }
    await generate(config)
    expect(resendGen).not.toHaveBeenCalled()
    expect(postmarkGen).not.toHaveBeenCalled()
  })

  it('calls resend generator when email is resend', async () => {
    const config = { ...baseConfig, outDir, email: 'resend' as const }
    await generate(config)
    expect(resendGen).toHaveBeenCalledWith(config, outDir)
    expect(postmarkGen).not.toHaveBeenCalled()
  })

  it('calls postmark generator when email is postmark', async () => {
    const config = { ...baseConfig, outDir, email: 'postmark' as const }
    await generate(config)
    expect(postmarkGen).toHaveBeenCalledWith(config, outDir)
    expect(resendGen).not.toHaveBeenCalled()
  })

  it('calls all generators when all options are set', async () => {
    const config: ProjectConfig = {
      name: 'full-app',
      outDir,
      auth: 'clerk',
      database: 'postgres',
      payments: 'stripe',
      email: 'resend',
    }
    await generate(config)
    expect(baseGen).toHaveBeenCalledOnce()
    expect(clerkGen).toHaveBeenCalledOnce()
    expect(postgresGen).toHaveBeenCalledOnce()
    expect(stripeGen).toHaveBeenCalledOnce()
    expect(resendGen).toHaveBeenCalledOnce()
  })

  it('removes outDir and rethrows when a generator fails (dir did not exist before)', async () => {
    const callOrder: string[] = []
    ;(baseGen as ReturnType<typeof vi.fn>).mockImplementation(async () => { callOrder.push('base') })
    ;(clerkGen as ReturnType<typeof vi.fn>).mockImplementation(async () => { callOrder.push('clerk') })
    ;(postgresGen as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      callOrder.push('postgres')
      throw new Error('postgres failed')
    })

    // outDir exists from beforeEach — remove it so dirExistedBefore is false
    await fs.remove(outDir)
    // Recreate so the generator can actually try to use it (base mock just resolves)
    // dirExistedBefore check happens before any generator runs, so we verify cleanup
    const config = { ...baseConfig, outDir }

    await expect(generate(config)).rejects.toThrow('postgres failed')
    expect(callOrder).toEqual(['base', 'clerk', 'postgres'])
    // generate() should have removed the dir since it didn't exist before
    expect(await fs.pathExists(outDir)).toBe(false)
  })

  it('removes outDir when first generator fails (dir did not exist before)', async () => {
    ;(baseGen as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('base failed'))

    // Ensure outDir does not exist so dirExistedBefore=false
    await fs.remove(outDir)
    const config = { ...baseConfig, outDir }

    await expect(generate(config)).rejects.toThrow('base failed')
    expect(await fs.pathExists(outDir)).toBe(false)
  })

  it('does not remove outDir and warns when generation fails into pre-existing directory', async () => {
    ;(postgresGen as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('postgres failed'))

    // outDir already exists (created by beforeEach) — dirExistedBefore=true
    expect(await fs.pathExists(outDir)).toBe(true)
    const config = { ...baseConfig, outDir }

    await expect(generate(config)).rejects.toThrow('postgres failed')
    // Directory must NOT be removed when it existed before generation started
    expect(await fs.pathExists(outDir)).toBe(true)
  })

  it('generators are called exactly once each for full config', async () => {
    const config: ProjectConfig = {
      name: 'my-app',
      outDir,
      auth: 'nextauth',
      database: 'sqlite',
      payments: 'lemonsqueezy',
      email: 'postmark',
    }
    await generate(config)

    expect(baseGen).toHaveBeenCalledOnce()
    expect(nextauthGen).toHaveBeenCalledOnce()
    expect(sqliteGen).toHaveBeenCalledOnce()
    expect(lemonsqueezyGen).toHaveBeenCalledOnce()
    expect(postmarkGen).toHaveBeenCalledOnce()

    // Others not called
    expect(clerkGen).not.toHaveBeenCalled()
    expect(supabaseAuthGen).not.toHaveBeenCalled()
    expect(postgresGen).not.toHaveBeenCalled()
    expect(supabaseDbGen).not.toHaveBeenCalled()
    expect(stripeGen).not.toHaveBeenCalled()
    expect(resendGen).not.toHaveBeenCalled()
  })
})
