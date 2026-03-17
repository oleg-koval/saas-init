import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

import * as p from '@clack/prompts'
import { promptEmail } from '../../src/prompts/email'

describe('promptEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(p.isCancel).mockReturnValue(false)
  })

  it('returns resend for Resend selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('resend' as any)
    const result = await promptEmail()
    expect(result).toEqual({ email: 'resend' })
  })

  it('returns postmark for Postmark selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('postmark' as any)
    const result = await promptEmail()
    expect(result).toEqual({ email: 'postmark' })
  })

  it('returns null for Skip selection', async () => {
    vi.mocked(p.select).mockResolvedValueOnce('none' as any)
    const result = await promptEmail()
    expect(result).toEqual({ email: null })
  })

  it('calls process.exit(0) when cancelled', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code: number) => {
        throw new Error(`process.exit(${code})`)
      }) as any)

    vi.mocked(p.isCancel).mockReturnValueOnce(true)
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel') as any)

    await expect(promptEmail()).rejects.toThrow('process.exit(0)')
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
