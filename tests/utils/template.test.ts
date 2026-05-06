import { describe, it, expect } from 'vitest'
import { replaceVars } from '../../src/utils/template'

describe('replaceVars', () => {
  it('replaces a single placeholder', () => {
    expect(replaceVars('Hello, {{name}}!', { name: 'world' })).toBe('Hello, world!')
  })

  it('replaces multiple placeholders', () => {
    expect(replaceVars('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Alice' })).toBe(
      'Hi, Alice!'
    )
  })

  it('leaves placeholder intact when key is missing', () => {
    expect(replaceVars('Hello, {{name}}!', {})).toBe('Hello, {{name}}!')
  })

  it('leaves unknown placeholder intact while replacing known ones', () => {
    expect(replaceVars('{{a}} and {{b}}', { a: 'foo' })).toBe('foo and {{b}}')
  })

  it('handles adjacent {{}} tokens', () => {
    expect(replaceVars('{{a}}{{b}}', { a: 'x', b: 'y' })).toBe('xy')
  })

  it('returns content unchanged with empty vars object', () => {
    expect(replaceVars('no placeholders here', {})).toBe('no placeholders here')
  })

  it('replaces the same placeholder multiple times', () => {
    expect(replaceVars('{{x}} and {{x}}', { x: 'val' })).toBe('val and val')
  })
})
