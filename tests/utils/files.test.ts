import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { writeTemplate, appendEnv } from '../../src/utils/files.js'

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'saas-init-test-'))
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe('writeTemplate', () => {
  it('writes content with variable substitution', async () => {
    const templatePath = path.join(tmpDir, 'template.txt')
    await fs.writeFile(templatePath, 'Hello {{name}}, version {{version}}!')

    const destPath = path.join(tmpDir, 'output', 'result.txt')
    await writeTemplate(templatePath, destPath, { name: 'world', version: '1.0' })

    const content = await fs.readFile(destPath, 'utf-8')
    expect(content).toBe('Hello world, version 1.0!')
  })

  it('preserves unmatched placeholders', async () => {
    const templatePath = path.join(tmpDir, 'template.txt')
    await fs.writeFile(templatePath, 'Hello {{name}}, {{missing}}!')

    const destPath = path.join(tmpDir, 'result.txt')
    await writeTemplate(templatePath, destPath, { name: 'world' })

    const content = await fs.readFile(destPath, 'utf-8')
    expect(content).toBe('Hello world, {{missing}}!')
  })

  it('creates destination directories if needed', async () => {
    const templatePath = path.join(tmpDir, 'template.txt')
    await fs.writeFile(templatePath, 'content')

    const destPath = path.join(tmpDir, 'a', 'b', 'c', 'result.txt')
    await writeTemplate(templatePath, destPath, {})

    expect(await fs.pathExists(destPath)).toBe(true)
  })

  it('writes with empty vars object', async () => {
    const templatePath = path.join(tmpDir, 'template.txt')
    await fs.writeFile(templatePath, 'no variables here')

    const destPath = path.join(tmpDir, 'result.txt')
    await writeTemplate(templatePath, destPath, {})

    const content = await fs.readFile(destPath, 'utf-8')
    expect(content).toBe('no variables here')
  })
})


describe('appendEnv', () => {
  it('creates .env.example if it does not exist', async () => {
    await appendEnv(tmpDir, { DB_URL: 'postgres://localhost/db' })

    const envPath = path.join(tmpDir, '.env.example')
    expect(await fs.pathExists(envPath)).toBe(true)
    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toContain('DB_URL=postgres://localhost/db')
  })

  it('appends new keys to existing file', async () => {
    const envPath = path.join(tmpDir, '.env.example')
    await fs.writeFile(envPath, 'EXISTING_KEY=value\n')

    await appendEnv(tmpDir, { NEW_KEY: 'newvalue' })

    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toContain('EXISTING_KEY=value')
    expect(content).toContain('NEW_KEY=newvalue')
  })

  it('does not duplicate existing keys', async () => {
    const envPath = path.join(tmpDir, '.env.example')
    await fs.writeFile(envPath, 'API_KEY=first\n')

    await appendEnv(tmpDir, { API_KEY: 'second' })

    const content = await fs.readFile(envPath, 'utf-8')
    const lines = content.split('\n').filter((l) => l.startsWith('API_KEY='))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('API_KEY=first')
  })

  it('does not overwrite on subsequent calls — second call adds new keys only', async () => {
    await appendEnv(tmpDir, { KEY_A: 'a' })
    await appendEnv(tmpDir, { KEY_B: 'b' })

    const envPath = path.join(tmpDir, '.env.example')
    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toContain('KEY_A=a')
    expect(content).toContain('KEY_B=b')
  })

  it('does nothing when all keys already present', async () => {
    const envPath = path.join(tmpDir, '.env.example')
    await fs.writeFile(envPath, 'KEY=value\n')

    await appendEnv(tmpDir, { KEY: 'other' })

    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toBe('KEY=value\n')
  })

  it('handles multiple new vars at once', async () => {
    await appendEnv(tmpDir, { VAR1: 'one', VAR2: 'two', VAR3: 'three' })

    const envPath = path.join(tmpDir, '.env.example')
    const content = await fs.readFile(envPath, 'utf-8')
    expect(content).toContain('VAR1=one')
    expect(content).toContain('VAR2=two')
    expect(content).toContain('VAR3=three')
  })
})
