import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/auth/supabase-auth.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  auth: 'supabase',
  database: 'postgres',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-supabase-auth-'))
  // Base generator must run first so package.json exists
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('supabase auth generator', () => {
  it('creates utils/supabase/client.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'utils/supabase/client.ts'))).toBe(true)
  })

  it('creates utils/supabase/server.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'utils/supabase/server.ts'))).toBe(true)
  })

  it('creates middleware.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'middleware.ts'))).toBe(true)
  })

  it('client.ts uses createBrowserClient', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'utils/supabase/client.ts'), 'utf-8')
    expect(content).toContain('createBrowserClient')
  })

  it('server.ts uses createServerClient', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'utils/supabase/server.ts'), 'utf-8')
    expect(content).toContain('createServerClient')
  })

  it('middleware.ts exports default', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'middleware.ts'), 'utf-8')
    expect(content).toContain('export default')
  })

  it('adds @supabase/ssr to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('@supabase/ssr')
  })

  it('adds @supabase/supabase-js to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('@supabase/supabase-js')
  })

  it('appends NEXT_PUBLIC_SUPABASE_URL to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_URL')
  })

  it('appends NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    expect(envContent).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })

  it('does not duplicate env vars when called twice', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const urlLines = envContent.split('\n').filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_URL'))
    const keyLines = envContent.split('\n').filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
    expect(urlLines.length).toBe(1)
    expect(keyLines.length).toBe(1)
  })
})
