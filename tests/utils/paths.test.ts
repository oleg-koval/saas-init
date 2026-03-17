import { describe, it, expect } from 'vitest'
import path from 'path'
import { existsSync } from 'fs'
import { TEMPLATES_ROOT } from '../../src/utils/paths'

describe('TEMPLATES_ROOT', () => {
  it('resolves to an existing directory', () => {
    expect(existsSync(TEMPLATES_ROOT)).toBe(true)
  })

  it('points to a directory named templates', () => {
    expect(path.basename(TEMPLATES_ROOT)).toBe('templates')
  })

  it('contains expected subdirectories', () => {
    expect(existsSync(path.join(TEMPLATES_ROOT, 'base'))).toBe(true)
    expect(existsSync(path.join(TEMPLATES_ROOT, 'auth'))).toBe(true)
    expect(existsSync(path.join(TEMPLATES_ROOT, 'database'))).toBe(true)
    expect(existsSync(path.join(TEMPLATES_ROOT, 'payments'))).toBe(true)
    expect(existsSync(path.join(TEMPLATES_ROOT, 'email'))).toBe(true)
  })
})
