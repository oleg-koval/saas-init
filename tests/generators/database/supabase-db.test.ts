import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/database/supabase-db.js'
import { generate as generateSupabaseAuth } from '../../../src/generators/auth/supabase-auth.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  nextVersion: '16',
  auth: 'clerk',
  database: 'supabase',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-supabase-db-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('supabase-db database generator', () => {
  it('creates utils/supabase/db.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'utils/supabase/db.ts'))).toBe(true)
  })

  it('creates utils/supabase/client.ts when auth is not supabase', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'utils/supabase/client.ts'))).toBe(true)
  })

  it('client.ts exports createBrowserClient using @supabase/supabase-js', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'utils/supabase/client.ts'), 'utf-8')
    expect(content).toContain('createBrowserClient')
    expect(content).toContain('@supabase/supabase-js')
  })

  it('does not write client.ts when auth is supabase (already written by auth generator)', async () => {
    await generateSupabaseAuth({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    const authClientContent = await fs.readFile(
      path.join(tmpDir, 'utils/supabase/client.ts'),
      'utf-8'
    )
    expect(authClientContent).toContain('createBrowserClient')
    expect(authClientContent).toContain('@supabase/ssr')

    await generate({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    // client.ts should remain unchanged (still using @supabase/ssr from auth generator)
    const clientAfter = await fs.readFile(path.join(tmpDir, 'utils/supabase/client.ts'), 'utf-8')
    expect(clientAfter).toContain('@supabase/ssr')
  })

  it('db.ts exports a supabase instance using createClient', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const content = await fs.readFile(path.join(tmpDir, 'utils/supabase/db.ts'), 'utf-8')
    expect(content).toContain('createClient')
    expect(content).toContain('@supabase/supabase-js')
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
    const urlLines = envContent.split('\n').filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_URL='))
    const anonLines = envContent
      .split('\n')
      .filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='))
    expect(urlLines.length).toBe(1)
    expect(anonLines.length).toBe(1)
  })

  it('writes db.ts separately when Supabase Auth generator already ran', async () => {
    // Run Supabase Auth generator first - writes client.ts using @supabase/ssr
    await generateSupabaseAuth({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    const authClientContent = await fs.readFile(
      path.join(tmpDir, 'utils/supabase/client.ts'),
      'utf-8'
    )
    expect(authClientContent).toContain('createBrowserClient')

    // Run Supabase DB generator with auth='supabase' - should write db.ts without touching client.ts
    await generate({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    const authClientAfter = await fs.readFile(
      path.join(tmpDir, 'utils/supabase/client.ts'),
      'utf-8'
    )
    expect(authClientAfter).toContain('createBrowserClient')
    expect(authClientAfter).toContain('@supabase/ssr')
    const dbContent = await fs.readFile(path.join(tmpDir, 'utils/supabase/db.ts'), 'utf-8')
    expect(dbContent).toContain('createClient')
    expect(dbContent).toContain('@supabase/supabase-js')
  })

  it('does not duplicate env vars when Supabase Auth generator already ran', async () => {
    await generateSupabaseAuth({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    await generate({ ...config, auth: 'supabase', outDir: tmpDir }, tmpDir)
    const envContent = await fs.readFile(path.join(tmpDir, '.env.example'), 'utf-8')
    const urlLines = envContent.split('\n').filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_URL='))
    const anonLines = envContent
      .split('\n')
      .filter((l) => l.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='))
    expect(urlLines.length).toBe(1)
    expect(anonLines.length).toBe(1)
  })
})
