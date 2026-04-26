import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate } from '../../src/generators/base.js'
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
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-base-'))
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('base generator', () => {
  it('creates all 7 base files', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const expectedFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'next.config.ts',
      'tsconfig.json',
      'package.json',
      '.gitignore',
    ]

    for (const file of expectedFiles) {
      expect(await fs.pathExists(path.join(tmpDir, file)), `${file} should exist`).toBe(true)
    }
  })

  it('creates postcss.config.mjs, lib/utils.ts, and components.json', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    expect(await fs.pathExists(path.join(tmpDir, 'postcss.config.mjs'))).toBe(true)
    expect(await fs.pathExists(path.join(tmpDir, 'lib/utils.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(tmpDir, 'components.json'))).toBe(true)
  })

  it('substitutes project name in package.json', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const pkgContent = await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgContent)
    expect(pkg.name).toBe('my-app')
  })

  it('includes next as a dependency in package.json', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const pkgContent = await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgContent)
    expect(pkg.dependencies).toHaveProperty('next')
  })

  it('sets next version to ^16.2.0 when nextVersion is 16', async () => {
    await generate({ ...config, nextVersion: '16', outDir: tmpDir }, tmpDir)

    const pkg = JSON.parse(await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8'))
    expect(pkg.dependencies.next).toBe('^16.2.0')
  })

  it('sets next version to ^15.3.0 when nextVersion is 15', async () => {
    await generate({ ...config, nextVersion: '15', outDir: tmpDir }, tmpDir)

    const pkg = JSON.parse(await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8'))
    expect(pkg.dependencies.next).toBe('^15.3.0')
  })

  it('includes tailwindcss in devDependencies and clsx in dependencies', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const pkgContent = await fs.readFile(path.join(tmpDir, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgContent)
    expect(pkg.devDependencies).toHaveProperty('tailwindcss')
    expect(pkg.devDependencies).toHaveProperty('@tailwindcss/postcss')
    expect(pkg.dependencies).toHaveProperty('clsx')
    expect(pkg.dependencies).toHaveProperty('tailwind-merge')
  })

  it('globals.css contains @import "tailwindcss"', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const css = await fs.readFile(path.join(tmpDir, 'app/globals.css'), 'utf-8')
    expect(css).toContain('@import "tailwindcss"')
  })

  it('substitutes project name in layout.tsx', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const layoutContent = await fs.readFile(path.join(tmpDir, 'app/layout.tsx'), 'utf-8')
    expect(layoutContent).toContain('my-app')
    expect(layoutContent).not.toContain('{{name}}')
  })

  it('generates valid tsconfig.json with strict mode', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const tsconfigContent = await fs.readFile(path.join(tmpDir, 'tsconfig.json'), 'utf-8')
    const tsconfig = JSON.parse(tsconfigContent)
    expect(tsconfig.compilerOptions.strict).toBe(true)
  })

  it('generates .gitignore with expected entries', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const gitignoreContent = await fs.readFile(path.join(tmpDir, '.gitignore'), 'utf-8')
    expect(gitignoreContent).toContain('node_modules')
    expect(gitignoreContent).toContain('.next')
    expect(gitignoreContent).toContain('.env.local')
  })
})
