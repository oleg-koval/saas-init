import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/payments/stripe.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  auth: 'clerk',
  database: 'postgres',
  payments: 'stripe',
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-stripe-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('stripe payments generator', () => {
  it('creates lib/stripe.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'lib/stripe.ts'))).toBe(true)
  })

  it('creates app/api/webhooks/stripe/route.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/api/webhooks/stripe/route.ts'))
    ).toBe(true)
  })

  it('adds stripe to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('stripe')
  })

  it('appends STRIPE_SECRET_KEY to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('STRIPE_SECRET_KEY')
  })

  it('appends STRIPE_WEBHOOK_SECRET to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('STRIPE_WEBHOOK_SECRET')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const secretKeyLines = envContent.split('\n').filter((l) => l.includes('STRIPE_SECRET_KEY'))
    const webhookLines = envContent
      .split('\n')
      .filter((l) => l.includes('STRIPE_WEBHOOK_SECRET'))
    expect(secretKeyLines.length).toBe(1)
    expect(webhookLines.length).toBe(1)
  })
})
