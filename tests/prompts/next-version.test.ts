import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptNextVersion } from '../../src/prompts/next-version'

describe('promptNextVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns 16 when Next.js 16 selected', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('16' as any)
    const result = await promptNextVersion()
    expect(result).toEqual({ nextVersion: '16' })
  })

  it('returns 15 when Next.js 15 selected', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('15' as any)
    const result = await promptNextVersion()
    expect(result).toEqual({ nextVersion: '15' })
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code: number) => {
      throw new Error(`process.exit(${code})`)
    }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptNextVersion()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
