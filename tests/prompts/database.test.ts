import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptDatabase } from '../../src/prompts/database'

describe('promptDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns postgres for Postgres selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('postgres' as any)
    const result = await promptDatabase()
    expect(result).toEqual({ database: 'postgres' })
  })

  it('returns sqlite for SQLite selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('sqlite' as any)
    const result = await promptDatabase()
    expect(result).toEqual({ database: 'sqlite' })
  })

  it('returns supabase for Supabase selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('supabase' as any)
    const result = await promptDatabase()
    expect(result).toEqual({ database: 'supabase' })
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code: number) => {
        throw new Error(`process.exit(${code})`)
      }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptDatabase()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
