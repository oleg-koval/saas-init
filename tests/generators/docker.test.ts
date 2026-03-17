import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { generate } from '../../src/generators/docker.js'
import type { ProjectConfig } from '../../src/types.js'

let tmpDir: string

const config: ProjectConfig = {
  name: 'my-app',
  outDir: '',
  auth: 'clerk',
  database: 'postgres',
  payments: null,
  email: null,
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-docker-'))
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('docker generator', () => {
  it('creates all 3 output files', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const expectedFiles = ['Dockerfile', '.dockerignore', 'docker-compose.yml']

    for (const file of expectedFiles) {
      expect(await fs.pathExists(path.join(tmpDir, file)), `${file} should exist`).toBe(true)
    }
  })

  it('Dockerfile has 3 FROM statements', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const dockerfile = await fs.readFile(path.join(tmpDir, 'Dockerfile'), 'utf-8')
    const fromCount = (dockerfile.match(/^FROM /gm) || []).length
    expect(fromCount).toBe(3)
  })

  it('docker-compose.yml contains config.name and no {{name}}', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const compose = await fs.readFile(path.join(tmpDir, 'docker-compose.yml'), 'utf-8')
    expect(compose).toContain('my-app')
    expect(compose).not.toContain('{{name}}')
  })

  it('.dockerignore contains node_modules', async () => {
    await generate({ ...config, outDir: tmpDir }, tmpDir)

    const dockerignore = await fs.readFile(path.join(tmpDir, '.dockerignore'), 'utf-8')
    expect(dockerignore).toContain('node_modules')
  })
})
