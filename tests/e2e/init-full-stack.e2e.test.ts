/**
 * E2E tests for full-stack combinations (payments + email providers)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { wirePrompts } from './helpers.js'

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  log: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
    step: vi.fn(),
  },
  select: vi.fn(),
  text: vi.fn(),
}))

vi.mock('child_process', () => ({ execSync: vi.fn() }))

import * as p from '@clack/prompts'
import { initCommand } from '../../src/commands/init.js'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-e2e-full-'))
  vi.clearAllMocks()
  vi.mocked(p.isCancel).mockReturnValue(false)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('E2E: full stack — Next.js 16 + Clerk + Postgres + Stripe + Resend', () => {
  beforeEach(() => {
    wirePrompts(tmpDir, {
      nextVersion: '16',
      auth: 'clerk',
      database: 'postgres',
      payments: 'stripe',
      email: 'resend',
    })
  })

  it('generates all provider files without throwing', async () => {
    await expect(initCommand()).resolves.toBeUndefined()
  })

  it('includes Stripe env vars in .env.local', async () => {
    await initCommand()

    const env = await fs.readFile(path.join(tmpDir, '.env.local'), 'utf-8')
    expect(env).toContain('STRIPE_SECRET_KEY=sk_test_stripe')
    expect(env).toContain('RESEND_API_KEY=re_api_key')
  })

  it('creates Stripe payment files', async () => {
    await initCommand()

    expect(await fs.pathExists(path.join(tmpDir, 'app/api/webhooks/stripe/route.ts'))).toBe(true)
  })
})
