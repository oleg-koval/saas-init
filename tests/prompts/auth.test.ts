import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptAuth } from '../../src/prompts/auth'

describe('promptAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns clerk for Clerk selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('clerk' as any)
    const result = await promptAuth()
    expect(result).toEqual({ auth: 'clerk' })
  })

  it('returns nextauth for NextAuth selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('nextauth' as any)
    const result = await promptAuth()
    expect(result).toEqual({ auth: 'nextauth' })
  })

  it('returns supabase for Supabase Auth selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('supabase' as any)
    const result = await promptAuth()
    expect(result).toEqual({ auth: 'supabase' })
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code: number) => {
        throw new Error(`process.exit(${code})`)
      }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptAuth()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
