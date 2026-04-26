import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate } from '../../src/generators/landing.js'
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
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-landing-'))
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('landing generator', () => {
  it('creates all 8 output files', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const expectedFiles = [
      'components/Hero.tsx',
      'components/ProblemAgitate.tsx',
      'components/ValueStack.tsx',
      'components/SocialProof.tsx',
      'components/Transformation.tsx',
      'components/SecondaryCTA.tsx',
      'components/Footer.tsx',
      'app/page.tsx',
    ]

    for (const file of expectedFiles) {
      expect(await fs.pathExists(path.join(tmpDir, file)), `${file} should exist`).toBe(true)
    }
  })

  it('substitutes config.name in Hero.tsx and does not leave {{name}}', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const hero = await fs.readFile(path.join(tmpDir, 'components/Hero.tsx'), 'utf-8')
    expect(hero).toContain('my-app')
    expect(hero).not.toContain('{{name}}')
  })

  it('substitutes config.name in Footer.tsx and does not leave {{name}}', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const footer = await fs.readFile(path.join(tmpDir, 'components/Footer.tsx'), 'utf-8')
    expect(footer).toContain('my-app')
    expect(footer).not.toContain('{{name}}')
  })

  it('no file contains unresolved {{ tokens', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const files = [
      'components/Hero.tsx',
      'components/ProblemAgitate.tsx',
      'components/ValueStack.tsx',
      'components/SocialProof.tsx',
      'components/Transformation.tsx',
      'components/SecondaryCTA.tsx',
      'components/Footer.tsx',
      'app/page.tsx',
    ]

    for (const file of files) {
      const content = await fs.readFile(path.join(tmpDir, file), 'utf-8')
      expect(content, `${file} should not contain unresolved {{`).not.toMatch(/\{\{/)
    }
  })

  it('page.tsx overwrites any existing app/page.tsx', async () => {
    await fs.ensureDir(path.join(tmpDir, 'app'))
    await fs.writeFile(path.join(tmpDir, 'app/page.tsx'), 'original content', 'utf-8')

    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const page = await fs.readFile(path.join(tmpDir, 'app/page.tsx'), 'utf-8')
    expect(page).not.toBe('original content')
    expect(page).toContain('Hero')
  })
})
