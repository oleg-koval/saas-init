import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/payments/lemonsqueezy.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  nextVersion: '16',
  auth: 'clerk',
  database: 'postgres',
  payments: 'lemonsqueezy',
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-lemonsqueezy-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('lemonsqueezy payments generator', () => {
  it('creates lib/lemonsqueezy.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'lib/lemonsqueezy.ts'))).toBe(true)
  })

  it('creates app/api/webhooks/lemonsqueezy/route.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/api/webhooks/lemonsqueezy/route.ts'))
    ).toBe(true)
  })

  it('adds @lemonsqueezy/lemonsqueezy.js to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('@lemonsqueezy/lemonsqueezy.js')
  })

  it('appends LEMONSQUEEZY_API_KEY to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('LEMONSQUEEZY_API_KEY')
  })

  it('appends LEMONSQUEEZY_WEBHOOK_SECRET to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('LEMONSQUEEZY_WEBHOOK_SECRET')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const apiKeyLines = envContent.split('\n').filter((l) => l.includes('LEMONSQUEEZY_API_KEY'))
    const webhookLines = envContent
      .split('\n')
      .filter((l) => l.includes('LEMONSQUEEZY_WEBHOOK_SECRET'))
    expect(apiKeyLines.length).toBe(1)
    expect(webhookLines.length).toBe(1)
  })
})
