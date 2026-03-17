import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/email/postmark.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  auth: 'clerk',
  database: 'postgres',
  payments: null,
  email: 'postmark',
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-postmark-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('postmark email generator', () => {
  it('creates lib/email.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'lib/email.ts'))).toBe(true)
  })

  it('lib/email.ts exports sendEmail', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'lib/email.ts'), 'utf-8')
    expect(content).toContain('sendEmail')
  })

  it('adds postmark to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('postmark')
  })

  it('appends POSTMARK_API_TOKEN to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('POSTMARK_API_TOKEN')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const lines = envContent.split('\n').filter((l) => l.includes('POSTMARK_API_TOKEN'))
    expect(lines.length).toBe(1)
  })
})
