import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/auth/nextauth.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  auth: 'nextauth',
  database: 'postgres',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-nextauth-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('nextauth generator', () => {
  it('creates app/api/auth/[...nextauth]/route.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/api/auth/[...nextauth]/route.ts'))
    ).toBe(true)
  })

  it('creates auth.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'auth.ts'))).toBe(true)
  })

  it('route handler exports GET and POST', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(
      path.join(tmpDir, 'app/api/auth/[...nextauth]/route.ts'),
      'utf-8'
    )
    expect(content).toContain('GET')
    expect(content).toContain('POST')
  })

  it('auth.ts exports handlers', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'auth.ts'), 'utf-8')
    expect(content).toContain('handlers')
  })

  it('adds next-auth v5 to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('next-auth')
    expect(pkg.dependencies['next-auth']).toMatch(/\^5\./)
  })

  it('appends AUTH_SECRET and AUTH_URL to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('AUTH_SECRET')
    expect(envContent).toContain('AUTH_URL')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const lines = envContent.split('\n').filter((l) => l.includes('AUTH_SECRET'))
    expect(lines.length).toBe(1)
  })
})
