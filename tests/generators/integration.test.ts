import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate } from '../../src/generators/index.js'
import type { ProjectConfig } from '../../src/types.js'

// Base files always present
const BASE_FILES = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'next.config.ts',
  'tsconfig.json',
  'package.json',
  '.gitignore',
]

// Auth-specific files
const AUTH_FILES: Record<string, string[]> = {
  clerk: [
    'middleware.ts',
    'app/sign-in/[[...sign-in]]/page.tsx',
    'app/sign-up/[[...sign-up]]/page.tsx',
  ],
  nextauth: [
    'app/api/auth/[...nextauth]/route.ts',
    'auth.ts',
  ],
  supabase: [
    'utils/supabase/client.ts',
    'utils/supabase/server.ts',
    'middleware.ts',
  ],
}

// Database-specific files
const DB_FILES: Record<string, string[]> = {
  postgres: ['drizzle.config.ts', 'db/schema.ts', 'db/index.ts'],
  sqlite: ['drizzle.config.ts', 'db/schema.ts', 'db/index.ts'],
  supabase: ['utils/supabase/db.ts', 'utils/supabase/client.ts'],
}

// Expected file counts per combo (payments=null, email=null)
// supabase db writes utils/supabase/db.ts + utils/supabase/client.ts (unless auth=supabase already wrote client.ts)
const EXPECTED_FILE_COUNT: Record<string, Record<string, number>> = {
  clerk: { postgres: 28, sqlite: 28, supabase: 27 },
  nextauth: { postgres: 27, sqlite: 27, supabase: 26 },
  supabase: { postgres: 28, sqlite: 28, supabase: 26 },
}

async function countFilesRecursive(dir: string): Promise<number> {
  const items = await fs.readdir(dir)
  let count = 0
  for (const item of items) {
    const full = path.join(dir, item)
    const stat = await fs.stat(full)
    if (stat.isDirectory()) {
      count += await countFilesRecursive(full)
    } else {
      count++
    }
  }
  return count
}

async function noDuplicateEnvLines(envPath: string): Promise<boolean> {
  if (!(await fs.pathExists(envPath))) return true
  const content = await fs.readFile(envPath, 'utf-8')
  const lines = content.split('\n').filter((l) => l.trim() !== '')
  return lines.length === new Set(lines).size
}

type AuthOption = 'clerk' | 'nextauth' | 'supabase'
type DbOption = 'postgres' | 'sqlite' | 'supabase'

const AUTH_COMBOS: AuthOption[] = ['clerk', 'nextauth', 'supabase']
const DB_COMBOS: DbOption[] = ['postgres', 'sqlite', 'supabase']

describe('integration: full scaffold', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-integration-'))
  })

  afterEach(async () => {
    await fs.remove(tmpDir)
  })

  for (const auth of AUTH_COMBOS) {
    for (const db of DB_COMBOS) {
      const label = `auth=${auth} + database=${db}`

      it(`completes without throwing: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await expect(generate(config)).resolves.toBeUndefined()
      })

      it(`contains app/layout.tsx and package.json: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-files`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        expect(await fs.pathExists(path.join(outDir, 'app/layout.tsx'))).toBe(true)
        expect(await fs.pathExists(path.join(outDir, 'package.json'))).toBe(true)
      })

      it(`contains all base files: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-base`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        for (const file of BASE_FILES) {
          expect(await fs.pathExists(path.join(outDir, file)), `missing: ${file}`).toBe(true)
        }
      })

      it(`contains expected auth files: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-auth`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        for (const file of AUTH_FILES[auth]) {
          expect(await fs.pathExists(path.join(outDir, file)), `missing auth file: ${file}`).toBe(true)
        }
      })

      it(`contains expected database files: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-dbfiles`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        for (const file of DB_FILES[db]) {
          expect(await fs.pathExists(path.join(outDir, file)), `missing db file: ${file}`).toBe(true)
        }
      })

      it(`file count matches expected constant: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-count`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        const count = await countFilesRecursive(outDir)
        expect(count).toBe(EXPECTED_FILE_COUNT[auth][db])
      })

      it(`.env.example has no duplicate lines: ${label}`, async () => {
        const outDir = path.join(tmpDir, `${auth}-${db}-env`)
        await fs.ensureDir(outDir)
        const config: ProjectConfig = {
          name: 'test-app',
          outDir,
          auth,
          database: db,
          payments: null,
          email: null,
        }
        await generate(config)
        const envPath = path.join(outDir, '.env.example')
        expect(await noDuplicateEnvLines(envPath)).toBe(true)
      })
    }
  }
})
