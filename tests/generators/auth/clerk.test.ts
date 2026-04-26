import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/auth/clerk.js'
import type { ProjectConfig } from '../../../src/types.js'

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
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-clerk-'))
  // Base generator must run first so package.json exists
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('clerk auth generator', () => {
  it('creates middleware.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'middleware.ts'))).toBe(true)
  })

  it('creates sign-in page', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/sign-in/[[...sign-in]]/page.tsx'))
    ).toBe(true)
  })

  it('creates sign-up page', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(
      await fs.pathExists(path.join(tmpDir, 'app/sign-up/[[...sign-up]]/page.tsx'))
    ).toBe(true)
  })

  it('middleware exports clerkMiddleware', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'middleware.ts'), 'utf-8')
    expect(content).toContain('clerkMiddleware')
  })

  it('adds @clerk/nextjs to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('@clerk/nextjs')
  })

  it('appends NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  })

  it('appends CLERK_SECRET_KEY to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('CLERK_SECRET_KEY')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const lines = envContent.split('\n').filter((l) => l.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'))
    expect(lines.length).toBe(1)
  })
})
