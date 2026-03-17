import { describe, it, expect } from 'vitest'
import { projectConfigSchema } from '../src/types'

const validConfig = {
  name: 'my-app',
  outDir: './my-app',
  auth: 'clerk',
  database: 'postgres',
  payments: 'stripe',
  email: 'resend',
}

describe('projectConfigSchema', () => {
  it('accepts a valid complete config', () => {
    const result = projectConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('accepts null for optional fields', () => {
    const result = projectConfigSchema.safeParse({
      ...validConfig,
      payments: null,
      email: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown auth value', () => {
    const result = projectConfigSchema.safeParse({
      ...validConfig,
      auth: 'firebase',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a null database', () => {
    const result = projectConfigSchema.safeParse({
      ...validConfig,
      database: null,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing name field', () => {
    const { name: _name, ...withoutName } = validConfig
    const result = projectConfigSchema.safeParse(withoutName)
    expect(result.success).toBe(false)
  })
})
