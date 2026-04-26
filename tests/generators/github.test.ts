import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate } from '../../src/generators/github.js'
import type { ProjectConfig } from '../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  nextVersion: '16',
  auth: 'clerk',
  database: 'postgres',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-github-'))
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('github generator', () => {
  it('creates ci.yml at the nested path', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const ciPath = path.join(tmpDir, '.github', 'workflows', 'ci.yml')
    expect(await fs.pathExists(ciPath)).toBe(true)
  })

  it('workflow name contains config.name and no {{name}}', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const ciPath = path.join(tmpDir, '.github', 'workflows', 'ci.yml')
    const content = await fs.readFile(ciPath, 'utf-8')
    expect(content).toContain('my-app')
    expect(content).not.toContain('{{name}}')
  })

  it('.env.example contains all 3 Vercel vars', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const envPath = path.join(tmpDir, '.env.example')
    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toContain('VERCEL_TOKEN=')
    expect(content).toContain('VERCEL_ORG_ID=')
    expect(content).toContain('VERCEL_PROJECT_ID=')
  })

  it('running the generator twice does not duplicate env vars', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const envPath = path.join(tmpDir, '.env.example')
    const content = await fs.readFile(envPath, 'utf-8')
    const tokenCount = (content.match(/^VERCEL_TOKEN=/gm) || []).length
    expect(tokenCount).toBe(1)
  })
})
