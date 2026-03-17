import { describe, it, expect } from 'vitest'
import { mergeDeps } from '../../src/utils/deps'

describe('mergeDeps', () => {
  it('standard merge combines both maps', () => {
    const base = { react: '^18.0.0', next: '^14.0.0' }
    const additions = { tailwindcss: '^3.0.0' }
    const result = mergeDeps(base, additions)
    expect(result).toEqual({
      react: '^18.0.0',
      next: '^14.0.0',
      tailwindcss: '^3.0.0',
    })
  })

  it('additions win on conflict', () => {
    const base = { react: '^17.0.0', next: '^13.0.0' }
    const additions = { react: '^18.0.0' }
    const result = mergeDeps(base, additions)
    expect(result.react).toBe('^18.0.0')
    expect(result.next).toBe('^13.0.0')
  })

  it('empty base returns additions', () => {
    const base = {}
    const additions = { stripe: '^14.0.0' }
    const result = mergeDeps(base, additions)
    expect(result).toEqual({ stripe: '^14.0.0' })
  })

  it('empty additions returns base', () => {
    const base = { next: '^14.0.0' }
    const additions = {}
    const result = mergeDeps(base, additions)
    expect(result).toEqual({ next: '^14.0.0' })
  })

  it('both empty returns empty object', () => {
    const result = mergeDeps({}, {})
    expect(result).toEqual({})
  })

  it('does not mutate base', () => {
    const base = { react: '^18.0.0' }
    const baseCopy = { ...base }
    mergeDeps(base, { react: '^19.0.0' })
    expect(base).toEqual(baseCopy)
  })

  it('does not mutate additions', () => {
    const additions = { react: '^19.0.0' }
    const additionsCopy = { ...additions }
    mergeDeps({ react: '^18.0.0' }, additions)
    expect(additions).toEqual(additionsCopy)
  })
})
