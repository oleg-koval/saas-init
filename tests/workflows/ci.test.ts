import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ciYmlPath = path.resolve(__dirname, '../..', '.github', 'workflows', 'ci.yml')

let content: string

beforeAll(async () => {
  content = await fs.readFile(ciYmlPath, 'utf-8')
})

describe('.github/workflows/ci.yml – permissions', () => {
  it('has a top-level permissions block', () => {
    expect(content).toMatch(/^permissions:/m)
  })

  it('sets contents to read', () => {
    expect(content).toMatch(/^\s+contents:\s+read\s*$/m)
  })

  it('does not grant write access to contents', () => {
    expect(content).not.toMatch(/contents:\s+write/)
  })

  it('permissions block appears before the jobs block', () => {
    const permissionsIndex = content.indexOf('permissions:')
    const jobsIndex = content.indexOf('jobs:')
    expect(permissionsIndex).toBeGreaterThan(-1)
    expect(jobsIndex).toBeGreaterThan(-1)
    expect(permissionsIndex).toBeLessThan(jobsIndex)
  })
})

describe('.github/workflows/ci.yml – removed docs-index job', () => {
  it('does not contain a docs-index job', () => {
    expect(content).not.toContain('docs-index')
  })

  it('does not reference docs-index-keeper', () => {
    expect(content).not.toContain('docs-index-keeper')
  })
})

describe('.github/workflows/ci.yml – retained jobs', () => {
  it('still contains the test job', () => {
    expect(content).toMatch(/^\s+test:/m)
  })

  it('test job runs pnpm test', () => {
    expect(content).toContain('pnpm test')
  })

  it('still contains the anti-slop job', () => {
    expect(content).toMatch(/^\s+anti-slop:/m)
  })

  it('anti-slop job is restricted to pull_request events', () => {
    expect(content).toContain("github.event_name == 'pull_request'")
  })
})