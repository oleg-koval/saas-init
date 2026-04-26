import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate as generateBase } from '../../../src/generators/base.js'
import { generate } from '../../../src/generators/database/sqlite.js'
import type { ProjectConfig } from '../../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  nextVersion: '16',
  auth: 'clerk',
  database: 'sqlite',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-sqlite-'))
  await generateBase({ ...config, outDir: tmpDir }, tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('sqlite database generator', () => {
  it('creates drizzle.config.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'drizzle.config.ts'))).toBe(true)
  })

  it('creates db/schema.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'db/schema.ts'))).toBe(true)
  })

  it('creates db/index.ts', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, 'db/index.ts'))).toBe(true)
  })

  it('adds drizzle-orm to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('drizzle-orm')
  })

  it('adds better-sqlite3 to package.json dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.dependencies).toHaveProperty('better-sqlite3')
  })

  it('adds drizzle-kit to package.json devDependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.devDependencies).toHaveProperty('drizzle-kit')
  })

  it('adds @types/better-sqlite3 to package.json devDependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    const pkg = await fs.readJson(path.join(tmpDir, 'package.json'))
    expect(pkg.devDependencies).toHaveProperty('@types/better-sqlite3')
  })

  it('does not create .env.example', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)
    expect(await fs.pathExists(path.join(tmpDir, '.env.example'))).toBe(false)
  })
})
